import React, { useRef, useState } from 'react';
import { Upload, Trash2, GripVertical, Pencil, Plus, Sparkles, ImagePlus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageCropperModal, type CropResult } from './ImageCropperModal';

export interface MultiImageUploaderProps {
  idPrefix: string;
  label: string;
  helperText?: string;
  /** Ordered list of already-processed (cropped) image data URLs. images[0] is treated as the cover. */
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function MultiImageUploader({
  idPrefix,
  label,
  helperText,
  value,
  onChange,
  maxImages = 12,
}: MultiImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingSources, setPendingSources] = useState<string[] | null>(null);
  const [reeditIndex, setReeditIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const dragItemIndex = useRef<number | null>(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false);

  const readFilesAsDataUrls = (files: FileList | File[]): Promise<string[]> => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    return Promise.all(
      arr.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsReadingFiles(true);
    try {
      const remaining = Math.max(0, maxImages - value.length);
      const list = Array.from(files).slice(0, remaining);
      if (list.length === 0) return;
      const dataUrls = await readFilesAsDataUrls(list);
      setPendingSources(dataUrls);
    } finally {
      setIsReadingFiles(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleCropComplete = (results: CropResult[]) => {
    if (reeditIndex !== null) {
      // Re-editing a single existing image
      const next = [...value];
      next[reeditIndex] = results[0].dataUrl;
      onChange(next);
      setReeditIndex(null);
    } else {
      onChange([...value, ...results.map((r) => r.dataUrl)]);
    }
    setPendingSources(null);
  };

  const handleRemove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
    if (activePreviewIdx >= next.length) setActivePreviewIdx(Math.max(0, next.length - 1));
  };

  const handleReeditExisting = (idx: number) => {
    setReeditIndex(idx);
  };

  // Drag-to-reorder (desktop) using native HTML5 DnD; falls back to arrow buttons on touch
  const handleDragStart = (idx: number) => {
    dragItemIndex.current = idx;
  };
  const handleDragOverItem = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragItemIndex.current === null || dragItemIndex.current === idx) return;
    const next = [...value];
    const [moved] = next.splice(dragItemIndex.current, 1);
    next.splice(idx, 0, moved);
    dragItemIndex.current = idx;
    onChange(next);
  };
  const handleDragEndItem = () => {
    dragItemIndex.current = null;
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const hasImages = value.length > 0;
  const canAddMore = value.length < maxImages;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] font-mono text-cyan-300 border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-0.5 rounded-full">
          {value.length}/{maxImages} IMAGES
        </span>
      </div>

      {helperText && <p className="text-[11px] text-neutral-400 font-light leading-relaxed">{helperText}</p>}

      <input
        ref={fileInputRef}
        id={`${idPrefix}-multi-file-input`}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Swipeable / clickable carousel preview of currently-attached images (Instagram post preview style) */}
      {hasImages && (
        <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-neutral-950">
          <div className="aspect-video w-full relative">
            <img
              src={value[activePreviewIdx]}
              alt={`Image ${activePreviewIdx + 1}`}
              className="w-full h-full object-cover"
            />
            {value.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActivePreviewIdx((i) => Math.max(0, i - 1))}
                  disabled={activePreviewIdx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 cursor-pointer touch-target"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewIdx((i) => Math.min(value.length - 1, i + 1))}
                  disabled={activePreviewIdx === value.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 cursor-pointer touch-target"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {value.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePreviewIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        i === activePreviewIdx ? 'bg-white w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            {activePreviewIdx === 0 && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-500/90 text-white text-[10px] font-mono font-bold">
                COVER
              </span>
            )}
          </div>

          {/* Thumbnail strip with drag-to-reorder + per-image edit/remove */}
          <div className="flex items-center gap-2 p-2.5 overflow-x-auto no-scrollbar bg-black/30">
            {value.map((img, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOverItem(e, idx)}
                onDragEnd={handleDragEndItem}
                onClick={() => setActivePreviewIdx(idx)}
                className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${
                  idx === activePreviewIdx ? 'border-purple-400 ring-2 ring-purple-500/40' : 'border-white/15'
                }`}
              >
                <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReeditExisting(idx);
                    }}
                    className="p-1.5 rounded-lg bg-white/90 text-neutral-800 cursor-pointer"
                    title="Edit crop"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    className="p-1.5 rounded-lg bg-red-500/90 text-white cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute top-0.5 left-0.5 p-0.5 rounded bg-black/50 text-white/70 hidden sm:block">
                  <GripVertical className="w-2.5 h-2.5" />
                </div>
                {/* Touch-friendly reorder fallback */}
                <div className="absolute bottom-0.5 right-0.5 flex gap-0.5 sm:hidden">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, -1);
                      }}
                      className="p-0.5 rounded bg-black/60 text-white"
                    >
                      <ChevronLeft className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {idx < value.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveImage(idx, 1);
                      }}
                      className="p-0.5 rounded bg-black/60 text-white"
                    >
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-400/60 flex items-center justify-center text-neutral-400 hover:text-purple-300 transition-colors cursor-pointer touch-target"
                title="Add more images"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state dropzone */}
      {!hasImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 touch-target group ${
            isDragging
              ? 'border-purple-400 bg-purple-950/20 shadow-lg shadow-purple-950/40'
              : 'border-white/15 bg-slate-900/40 hover:border-purple-400/60 hover:bg-slate-900/70'
          }`}
        >
          {isReadingFiles ? (
            <div className="py-6 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              <div className="text-xs font-mono text-purple-300 tracking-wider uppercase">Reading Images...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-all shadow-md">
                <ImagePlus className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                  Click or Drag & Drop Multiple Images
                </div>
                <div className="text-xs text-neutral-400 font-light">
                  Select several screenshots at once, then crop &amp; rotate each individually
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!hasImages && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-purple-950/60 border border-white/15 hover:border-purple-400/60 text-neutral-200 hover:text-purple-200 text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] touch-target"
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" />
          <span>Choose Images</span>
        </button>
      )}

      {/* Cropper for a freshly-selected batch */}
      {pendingSources && (
        <ImageCropperModal
          sources={pendingSources}
          title="Crop Batch Images"
          onCancel={() => setPendingSources(null)}
          onComplete={handleCropComplete}
        />
      )}

      {/* Cropper for re-editing one already-saved image */}
      {reeditIndex !== null && (
        <ImageCropperModal
          sources={[value[reeditIndex]]}
          title={`Edit Image ${reeditIndex + 1}`}
          onCancel={() => setReeditIndex(null)}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
