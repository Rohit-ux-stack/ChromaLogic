import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  Sparkles,
  Layers
} from 'lucide-react';
import { formatBytes } from '../utils/imageBlob';
import { useImageUpload, type ImageUploadOptions } from '../hooks/useImageUpload';

export interface ImageBlobUploaderProps {
  idPrefix: string;
  label: string;
  helperText?: string;
  value: string;
  onChange: (blobDataUrl: string) => void;
  previewShape?: 'circle' | 'video' | 'banner' | 'rectangle';
  maxDimension?: number;
  quality?: number;
  recommendedAspect?: string;
  autoSaveOptions?: ImageUploadOptions;
  onSaveSuccess?: () => void;
}

export function ImageBlobUploader({
  idPrefix,
  label,
  helperText,
  value,
  onChange,
  previewShape = 'rectangle',
  maxDimension = 1200,
  quality = 0.85,
  recommendedAspect,
  autoSaveOptions,
  onSaveSuccess,
}: ImageBlobUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ size?: number; width?: number; height?: number } | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);

  const {
    isUploading,
    isSavingToFirestore,
    error,
    uploadAndSave,
    reset,
  } = useImageUpload();

  const hasValue = Boolean(value && value.trim().length > 0);
  const isBlobDataUrl = value.startsWith('data:image/');

  // Recalculate approximate meta if value exists as blob
  useEffect(() => {
    if (value && isBlobDataUrl && !imageMeta) {
      const approxBytes = Math.round((value.length * 3) / 4);
      setImageMeta({ size: approxBytes });
    }
  }, [value, isBlobDataUrl, imageMeta]);

  const handleFile = async (file: File) => {
    try {
      const result = await uploadAndSave(file, {
        maxDimension,
        quality,
        ...autoSaveOptions,
      });

      onChange(result.dataUrl);
      setImageMeta({
        size: result.sizeBytes,
        width: result.width,
        height: result.height,
      });

      if (autoSaveOptions?.autoSaveToFirestore && onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setImageMeta(null);
    reset();
  };

  const isBusy = isUploading || isSavingToFirestore;

  return (
    <div className="space-y-3">
      {/* Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{label}</span>
        </label>
        {recommendedAspect && (
          <span className="text-[10px] font-mono text-cyan-300 border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 rounded-full">
            ASPECT: {recommendedAspect}
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
          {helperText}
        </p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={`${idPrefix}-file-input`}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Upload Dropzone or Current Image Preview */}
      {!hasValue ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 touch-target group ${
            isDragging
              ? 'border-purple-400 bg-purple-950/20 shadow-lg shadow-purple-950/40'
              : 'border-white/15 bg-slate-900/40 hover:border-purple-400/60 hover:bg-slate-900/70 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]'
          }`}
        >
          {isBusy ? (
            <div className="py-6 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              <div className="text-xs font-mono text-purple-300 tracking-wider uppercase">
                {isSavingToFirestore ? 'SYNCING BLOB TO FIRESTORE...' : 'ENCODING BASE64 BLOB DATA...'}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 group-hover:border-purple-300 group-hover:text-purple-200 transition-all shadow-md">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                  Click to Upload or Drag & Drop Image
                </div>
                <div className="text-xs text-neutral-400 font-light">
                  PNG, JPG, WEBP, or SVG • Stored directly as optimized base64 Blob in Firestore
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image Preview & Details Card */
        <div className="p-4 sm:p-5 rounded-3xl glass-surface space-y-4 border border-white/15 hover:border-purple-500/40 shadow-xl transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Shape-adaptive live preview container */}
            <div className="flex items-center gap-4 min-w-0">
              {previewShape === 'circle' ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-purple-400/50 bg-slate-950 shrink-0 shadow-lg ring-4 ring-purple-500/20">
                  <img
                    src={value}
                    alt="Blob Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : previewShape === 'video' ? (
                <div className="aspect-video w-32 sm:w-40 rounded-2xl overflow-hidden border border-purple-400/40 bg-slate-950 shrink-0 shadow-lg ring-2 ring-purple-500/20">
                  <img
                    src={value}
                    alt="Blob Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : previewShape === 'banner' ? (
                <div className="aspect-[1200/630] w-36 sm:w-48 rounded-2xl overflow-hidden border border-purple-400/40 bg-slate-950 shrink-0 shadow-lg ring-2 ring-purple-500/20">
                  <img
                    src={value}
                    alt="Blob Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-purple-400/40 bg-slate-950 shrink-0 shadow-lg ring-2 ring-purple-500/20">
                  <img
                    src={value}
                    alt="Blob Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="space-y-1 min-w-0 font-mono">
                <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BLOB IMAGE ATTACHED</span>
                </div>
                <div className="text-[11px] text-neutral-400 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-200">
                    {isBlobDataUrl ? 'Direct Base64 Blob' : 'External URL'}
                  </span>
                  {imageMeta?.size ? (
                    <span className="text-neutral-300">{formatBytes(imageMeta.size)}</span>
                  ) : null}
                  {imageMeta?.width && imageMeta?.height ? (
                    <span className="text-neutral-400">{imageMeta.width}×{imageMeta.height}px</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                id={`${idPrefix}-replace-btn`}
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/60 border border-white/15 hover:border-purple-400/60 text-neutral-200 hover:text-purple-200 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] touch-target hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                id={`${idPrefix}-remove-btn`}
                onClick={handleRemove}
                disabled={isBusy}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] touch-target hover:shadow-red-950/40"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error alert if any */}
      {error && (
        <div className="p-3 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Optional URL Toggle Fallback */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[11px] font-mono text-neutral-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FileCode className="w-3 h-3 text-purple-400" />
          <span>{showUrlFallback ? 'Hide Direct URL Input' : 'Or enter custom Image URL manually'}</span>
        </button>

        {showUrlFallback && (
          <div className="mt-2">
            <input
              id={`${idPrefix}-manual-url-input`}
              type="text"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setImageMeta(null);
              }}
              placeholder="Paste raw data:image/... or https://..."
              className="w-full px-4 py-2.5 rounded-2xl glass-surface-subtle text-neutral-200 text-xs font-mono focus:border-purple-400 focus:outline-none min-h-[40px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
