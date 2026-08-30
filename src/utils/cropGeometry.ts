/**
 * Pure geometry + canvas rendering helpers that power the Instagram-style
 * cropper (ImageCropperModal). Kept dependency-free so the cropper works
 * fully client-side with zero third-party libraries.
 */

export type RotationDeg = 0 | 90 | 180 | 270;

export interface CropTransform {
  zoom: number; // >= 1
  offsetX: number; // screen-space pan in px
  offsetY: number; // screen-space pan in px
  rotation: RotationDeg;
}

export interface FrameSize {
  width: number;
  height: number;
}

export const DEFAULT_TRANSFORM: CropTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

export interface AspectPreset {
  id: string;
  label: string;
  ratio: number | null; // null = free-form
}

export const ASPECT_PRESETS: AspectPreset[] = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
  { id: '4:5', label: '4:5', ratio: 4 / 5 },
  { id: '9:16', label: '9:16', ratio: 9 / 16 },
  { id: '3:4', label: '3:4', ratio: 3 / 4 },
  { id: '5:4', label: '5:4', ratio: 5 / 4 },
];

export function clamp(value: number, min: number, max: number): number {
  if (min > max) return (min + max) / 2;
  return Math.min(max, Math.max(min, value));
}

/**
 * Computes the base "cover fit" render size of a natural image so that it
 * fully covers a frame of frameW x frameH, taking the eventual 90/270deg
 * rotation into account (since rotating the image swaps its visual footprint).
 */
export function computeCoverSize(
  naturalW: number,
  naturalH: number,
  frame: FrameSize,
  rotation: RotationDeg
): { width: number; height: number } {
  const swapped = rotation % 180 !== 0;
  const effFrameW = swapped ? frame.height : frame.width;
  const effFrameH = swapped ? frame.width : frame.height;
  const scale = Math.max(effFrameW / naturalW, effFrameH / naturalH);
  return {
    width: naturalW * scale,
    height: naturalH * scale,
  };
}

/**
 * Given the current zoom/rotation and a base cover size, returns the max
 * allowed pan offset (in screen px) in each axis so the image can never
 * reveal empty space inside the crop frame.
 */
export function computeMaxOffsets(
  coverSize: { width: number; height: number },
  zoom: number,
  rotation: RotationDeg,
  frame: FrameSize
): { maxX: number; maxY: number } {
  const zoomedW = coverSize.width * zoom;
  const zoomedH = coverSize.height * zoom;
  const swapped = rotation % 180 !== 0;
  const boundW = swapped ? zoomedH : zoomedW;
  const boundH = swapped ? zoomedW : zoomedH;
  return {
    maxX: Math.max(0, (boundW - frame.width) / 2),
    maxY: Math.max(0, (boundH - frame.height) / 2),
  };
}

/** Clamps a full transform's pan offsets against the current frame/zoom/rotation. */
export function clampTransform(
  transform: CropTransform,
  coverSize: { width: number; height: number },
  frame: FrameSize
): CropTransform {
  const { maxX, maxY } = computeMaxOffsets(coverSize, transform.zoom, transform.rotation, frame);
  return {
    ...transform,
    offsetX: clamp(transform.offsetX, -maxX, maxX),
    offsetY: clamp(transform.offsetY, -maxY, maxY),
  };
}

/**
 * Renders the final cropped (and rotated) image onto a canvas and returns a
 * compressed data URL. This mirrors exactly what's visible inside the live
 * on-screen crop frame.
 */
export function renderCroppedImage(
  image: HTMLImageElement,
  transform: CropTransform,
  frame: FrameSize,
  coverSize: { width: number; height: number },
  options: { maxDimension?: number; quality?: number } = {}
): { dataUrl: string; width: number; height: number } {
  const { maxDimension = 1600, quality = 0.88 } = options;
  const { zoom, offsetX, offsetY, rotation } = transform;

  const frameAspect = frame.width / frame.height;
  let targetW = maxDimension;
  let targetH = maxDimension / frameAspect;
  if (targetH > maxDimension) {
    targetH = maxDimension;
    targetW = maxDimension * frameAspect;
  }
  targetW = Math.round(targetW);
  targetH = Math.round(targetH);

  // Natural-image-space scale factor (cover-fit * user zoom)
  const s0 = coverSize.width / image.naturalWidth;
  const totalScale = s0 * zoom;

  // Vector from image's rendered center to the (fixed) frame center, in screen px
  const screenDX = -offsetX;
  const screenDY = -offsetY;

  // Undo rotation to get the vector in the image's local (pre-rotation) orientation
  const rad = (-rotation * Math.PI) / 180;
  const localDX = screenDX * Math.cos(rad) - screenDY * Math.sin(rad);
  const localDY = screenDX * Math.sin(rad) + screenDY * Math.cos(rad);

  // Convert to natural image pixel units
  const natDX = localDX / totalScale;
  const natDY = localDY / totalScale;

  const centerXNat = image.naturalWidth / 2 + natDX;
  const centerYNat = image.naturalHeight / 2 + natDY;

  const swapped = rotation % 180 !== 0;
  const localFrameW = swapped ? frame.height : frame.width;
  const localFrameH = swapped ? frame.width : frame.height;

  const natCropW = localFrameW / totalScale;
  const natCropH = localFrameH / totalScale;

  const cropLeft = centerXNat - natCropW / 2;
  const cropTop = centerYNat - natCropH / 2;

  let localTargetW = swapped ? targetH : targetW;
  let localTargetH = swapped ? targetW : targetH;

  // Never manufacture pixels the source doesn't have: if the natural crop
  // region (natCropW x natCropH) has fewer pixels than the requested output,
  // scale the output down to match the source's real resolution instead of
  // upscaling it (which just produces a soft/blurry result). Only caps when
  // it would otherwise be an upscale (capFactor < 1); a source with plenty
  // of resolution is unaffected.
  const capFactor = Math.min(1, natCropW / localTargetW, natCropH / localTargetH);
  if (capFactor < 1 && Number.isFinite(capFactor) && capFactor > 0) {
    localTargetW = Math.max(1, Math.round(localTargetW * capFactor));
    localTargetH = Math.max(1, Math.round(localTargetH * capFactor));
  }

  targetW = swapped ? localTargetH : localTargetW;
  targetH = swapped ? localTargetW : localTargetH;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for crop rendering.');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.save();
  ctx.translate(targetW / 2, targetH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(
    image,
    cropLeft,
    cropTop,
    natCropW,
    natCropH,
    -localTargetW / 2,
    -localTargetH / 2,
    localTargetW,
    localTargetH
  );
  ctx.restore();

  let mimeType = 'image/webp';
  let dataUrl = canvas.toDataURL(mimeType, quality);
  if (!dataUrl.startsWith('data:image/webp')) {
    mimeType = 'image/jpeg';
    dataUrl = canvas.toDataURL(mimeType, quality);
  }

  return { dataUrl, width: targetW, height: targetH };
}

/** Loads a data URL / URL into an HTMLImageElement, resolved once decoded. */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
