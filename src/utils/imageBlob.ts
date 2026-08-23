/**
 * Utilities for client-side Image File / Blob processing and compression.
 * Converts uploaded image files into high-quality, lightweight Base64 Data URL Blobs
 * suitable for direct Firestore storage and instant rendering.
 */

export interface ProcessedImageResult {
  dataUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
  mimeType: string;
  originalName: string;
}

/**
 * Compresses and scales an image File to a high-fidelity WebP/JPEG data URL blob.
 * @param file The image File object from input or drop event.
 * @param maxDimension The maximum width or height in pixels (default 1200).
 * @param quality Compression quality from 0.1 to 1.0 (default 0.85).
 */
export async function processImageFileToBlob(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    // If SVG, preserve vector content directly as data URL without rasterizing
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          sizeBytes: file.size,
          width: 800,
          height: 800,
          mimeType: 'image/svg+xml',
          originalName: file.name,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data URL if canvas context unavailable
          resolve({
            dataUrl: rawDataUrl,
            sizeBytes: file.size,
            width: img.width,
            height: img.height,
            mimeType: file.type || 'image/jpeg',
            originalName: file.name,
          });
          return;
        }

        // Draw and smooth
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression and fidelity, fallback to JPEG
        let mimeType = 'image/webp';
        let compressedDataUrl = canvas.toDataURL(mimeType, quality);

        // If WebP is not supported or larger, use JPEG/PNG
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          compressedDataUrl = canvas.toDataURL(mimeType, quality);
        }

        // Approximate byte size from base64 string
        const sizeBytes = Math.round((compressedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          sizeBytes,
          width,
          height,
          mimeType,
          originalName: file.name,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to decode image file. Please provide a valid PNG, JPG, WEBP, or SVG.'));
      };

      img.src = rawDataUrl;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human-readable string (e.g. 142 KB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
