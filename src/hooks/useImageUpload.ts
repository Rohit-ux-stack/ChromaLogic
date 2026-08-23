import { useState, useCallback } from 'react';
import { db, doc, setDoc, handleFirestoreError, OperationType } from '../firebase';
import { processImageFileToBlob, type ProcessedImageResult } from '../utils/imageBlob';

export interface ImageUploadOptions {
  /** Target Firestore document type (e.g. 'profile', 'project') */
  docType?: 'profile' | 'project';
  /** Target document ID in Firestore 'content' collection */
  docId?: string;
  /** Field name to update in the Firestore document */
  fieldName?: 'photoUrl' | 'ogBannerUrl' | 'imageUrl' | string;
  /** Max pixel dimension (width or height) to scale down to */
  maxDimension?: number;
  /** Image compression quality (0.1 to 1.0) */
  quality?: number;
  /** If true, updates Firestore directly upon conversion */
  autoSaveToFirestore?: boolean;
}

export interface ImageUploadState {
  isUploading: boolean;
  isSavingToFirestore: boolean;
  error: string | null;
  result: ProcessedImageResult | null;
}

export function useImageUpload() {
  const [state, setState] = useState<ImageUploadState>({
    isUploading: false,
    isSavingToFirestore: false,
    error: null,
    result: null,
  });

  /**
   * Validate uploaded file type and pre-compression constraints.
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'No file provided.' };
    }

    const acceptedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    if (!acceptedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Invalid file format. Please select an image file (PNG, JPG, WEBP, GIF, or SVG).',
      };
    }

    // Limit source file size to 15MB before client-side downscaling & compression
    const maxSourceSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSourceSizeBytes) {
      return {
        valid: false,
        error: 'Image file is too large (exceeds 15MB). Please select a smaller image.',
      };
    }

    return { valid: true };
  }, []);

  /**
   * Convert file to optimized base64 blob data URL.
   */
  const convertToBlob = useCallback(
    async (
      file: File,
      maxDimension = 1200,
      quality = 0.85
    ): Promise<ProcessedImageResult> => {
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid file');
      }

      setState((prev) => ({ ...prev, isUploading: true, error: null }));

      try {
        const processed = await processImageFileToBlob(file, maxDimension, quality);
        setState((prev) => ({
          ...prev,
          isUploading: false,
          result: processed,
          error: null,
        }));
        return processed;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to process image blob.';
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: message,
        }));
        throw err;
      }
    },
    [validateFile]
  );

  /**
   * Process image file and optionally save directly to Firestore document.
   */
  const uploadAndSave = useCallback(
    async (file: File, options?: ImageUploadOptions): Promise<ProcessedImageResult> => {
      const maxDim = options?.maxDimension || 1200;
      const qual = options?.quality || 0.85;

      const processed = await convertToBlob(file, maxDim, qual);

      if (options?.autoSaveToFirestore && options.docId && options.fieldName) {
        setState((prev) => ({ ...prev, isSavingToFirestore: true, error: null }));
        try {
          const docRef = doc(db, 'content', options.docId);
          await setDoc(
            docRef,
            {
              type: options.docType || 'profile',
              [options.fieldName]: processed.dataUrl,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err: unknown) {
          handleFirestoreError(err, OperationType.WRITE, `content/${options.docId}`);
          setState((prev) => ({
            ...prev,
            isSavingToFirestore: false,
            error: 'Failed to update Firestore document with image blob.',
          }));
          throw err;
        } finally {
          setState((prev) => ({ ...prev, isSavingToFirestore: false }));
        }
      }

      return processed;
    },
    [convertToBlob]
  );

  /**
   * Reset the upload hook state.
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      isSavingToFirestore: false,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...state,
    validateFile,
    convertToBlob,
    uploadAndSave,
    reset,
  };
}
