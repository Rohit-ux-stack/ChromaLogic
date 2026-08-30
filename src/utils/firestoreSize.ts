/**
 * Firestore caps a single document at 1 MiB (1,048,576 bytes) total across
 * all of its fields. Project/design carousels store cropped screenshots as
 * base64 data URLs directly on the document, so it's easy to blow past that
 * cap with just a handful of images — and when that happens the write fails
 * outright with an unhelpful error, silently dropping every image.
 *
 * This estimates the encoded size of a payload *before* attempting the
 * write, so the UI can surface a clear, actionable error instead of a
 * generic "Failed to save" toast.
 */

// Firestore's real limit is 1,048,576 bytes. Leave headroom for Firestore's
// own per-field/document overhead (field name bytes, per-string overhead,
// index metadata, etc.) rather than cutting it exactly at the wire.
export const FIRESTORE_DOC_SAFE_LIMIT_BYTES = 900_000;

/** Rough byte size of a UTF-16 JS string as Firestore would store it. */
function stringByteSize(value: string | undefined | null): number {
  if (!value) return 0;
  // Approximate UTF-8 byte length without needing TextEncoder fallbacks.
  return new Blob([value]).size;
}

export interface DocSizeEstimate {
  totalBytes: number;
  imagesBytes: number;
  overLimit: boolean;
  /** Human-readable size, e.g. "1.2 MB" */
  formatted: string;
}

/**
 * Estimates the total encoded size of a Firestore document payload, given
 * its image data-URL array plus any other string fields that will be
 * written alongside it.
 */
export function estimateDocSize(images: string[], otherFields: Record<string, unknown> = {}): DocSizeEstimate {
  const imagesBytes = images.reduce((sum, img) => sum + stringByteSize(img), 0);
  const otherBytes = Object.values(otherFields).reduce<number>((sum, v) => {
    if (typeof v === 'string') return sum + stringByteSize(v);
    return sum;
  }, 0);
  const totalBytes = imagesBytes + otherBytes;
  return {
    totalBytes,
    imagesBytes,
    overLimit: totalBytes > FIRESTORE_DOC_SAFE_LIMIT_BYTES,
    formatted: formatBytes(totalBytes),
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
