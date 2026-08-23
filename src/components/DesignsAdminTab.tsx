import React, { useState } from 'react';
import { Palette, Plus, Trash2, Edit2, X, Save, Sparkles, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { db, collection, doc, setDoc, addDoc, deleteDoc, handleFirestoreError, OperationType } from '../firebase';
import type { DesignData } from '../types';
import { ImageBlobUploader } from './ImageBlobUploader';

interface DesignsAdminTabProps {
  designs: DesignData[];
  onNotify: (text: string, type: 'success' | 'error') => void;
}

interface DesignDraft {
  id: string;
  title: string;
  category: string;
  clientOrTool: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  order: number;
}

export function DesignsAdminTab({ designs, onNotify }: DesignsAdminTabProps) {
  // Dynamic Multiple Form Blocks State
  const [drafts, setDrafts] = useState<DesignDraft[]>([
    {
      id: `draft-design-${Date.now()}`,
      title: '',
      category: 'Graphic Design',
      clientOrTool: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      order: designs.length + 1,
    },
  ]);
  const [submittingDraftIds, setSubmittingDraftIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const addNewDraft = () => {
    setDrafts((prev) => [
      ...prev,
      {
        id: `draft-design-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: '',
        category: 'Graphic Design',
        clientOrTool: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        order: designs.length + prev.length + 1,
      },
    ]);
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (remaining.length === 0) {
        return [
          {
            id: `draft-design-${Date.now()}`,
            title: '',
            category: 'Graphic Design',
            clientOrTool: '',
            description: '',
            imageUrl: '',
            projectUrl: '',
            order: designs.length + 1,
          },
        ];
      }
      return remaining;
    });
  };

  const updateDraft = (id: string, field: keyof DesignDraft, value: string | number) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Edit State
  const [editingDesign, setEditingDesign] = useState<DesignData | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editClientOrTool, setEditClientOrTool] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editProjectUrl, setEditProjectUrl] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = (design: DesignData) => {
    setEditingDesign(design);
    setEditTitle(design.title);
    setEditCategory(design.category || 'Graphic Design');
    setEditClientOrTool(design.clientOrTool || '');
    setEditDescription(design.description || '');
    setEditImageUrl(design.imageUrl || '');
    setEditProjectUrl(design.projectUrl || '');
    setEditOrder(design.order || 0);
  };

  const cancelEdit = () => {
    setEditingDesign(null);
  };

  const handleUpdateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;

    if (!editTitle.trim()) {
      onNotify('Artwork title is required.', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      const docRef = doc(db, 'content', editingDesign.id);
      await setDoc(
        docRef,
        {
          type: 'design',
          title: editTitle.trim(),
          category: editCategory.trim() || 'Graphic Design',
          clientOrTool: editClientOrTool.trim(),
          description: editDescription.trim(),
          imageUrl: editImageUrl.trim(),
          projectUrl: editProjectUrl.trim(),
          order: Number(editOrder) || 0,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setEditingDesign(null);
      onNotify('Design artwork updated successfully in Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `content/${editingDesign.id}`);
      onNotify('Failed to update design artwork.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSaveDraft = async (draft: DesignDraft) => {
    if (!draft.title.trim()) {
      onNotify('Artwork title is required.', 'error');
      return;
    }

    setSubmittingDraftIds((prev) => new Set(prev).add(draft.id));
    try {
      const contentCollection = collection(db, 'content');
      await addDoc(contentCollection, {
        type: 'design',
        title: draft.title.trim(),
        category: draft.category.trim() || 'Graphic Design',
        clientOrTool: draft.clientOrTool.trim(),
        description: draft.description.trim(),
        imageUrl: draft.imageUrl.trim(),
        projectUrl: draft.projectUrl.trim(),
        order: Number(draft.order) || 0,
        createdAt: new Date().toISOString(),
      });

      removeDraft(draft.id);
      onNotify(`Artwork "${draft.title.trim()}" added to Firestore successfully.`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'content/design');
      onNotify('Failed to create design document.', 'error');
    } finally {
      setSubmittingDraftIds((prev) => {
        const next = new Set(prev);
        next.delete(draft.id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'content', id));
      onNotify('Design artwork deleted from Firestore.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `content/${id}`);
      onNotify('Failed to delete design document.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Edit Design Modal / Flyout */}
      {editingDesign && (
        <div className="glass-surface-elevated rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-amber-400/50 ring-4 ring-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                Editing Design: {editingDesign.title}
              </h3>
            </div>
            <button
              onClick={cancelEdit}
              className="p-2 rounded-xl glass-surface hover:text-white text-neutral-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleUpdateDesign} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editOrder}
                  onChange={(e) => setEditOrder(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none font-mono min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Category (e.g. UI/UX, Branding, 3D Art)
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                  Tools / Client (e.g. Figma, Illustrator)
                </label>
                <input
                  type="text"
                  value={editClientOrTool}
                  onChange={(e) => setEditClientOrTool(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Description / Context
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <ImageBlobUploader
              idPrefix={`edit-design-image-${editingDesign.id}`}
              label="Artwork Image (Base64 Blob Storage)"
              helperText="Upload your design visual. Compressed and stored directly in Firestore."
              value={editImageUrl}
              onChange={(newBlob) => setEditImageUrl(newBlob)}
              previewShape="rectangle"
              maxDimension={1200}
              recommendedAspect="4:3"
            />

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                External Project URL (Optional)
              </label>
              <input
                type="url"
                value={editProjectUrl}
                onChange={(e) => setEditProjectUrl(e.target.value)}
                placeholder="https://behance.net/... or https://dribbble.com/..."
                className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-2xl glass-surface text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SAVING...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>UPDATE ARTWORK</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header with Dynamic Add New Form Block button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>DESIGN REPOSITORY // MULTI-ENTRY WORKSPACE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
            Add Graphic Design / Visual Work
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
            Create single or multiple artwork entries concurrently with base64 blob image storage.
          </p>
        </div>

        {/* Distinct Outline "+ ADD NEW" Button */}
        <button
          type="button"
          onClick={addNewDraft}
          className="self-start sm:self-auto px-5 py-3 rounded-2xl border-2 border-dashed border-amber-400/60 hover:border-amber-300 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-98 min-h-[44px] touch-target"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ ADD NEW FORM BLOCK</span>
        </button>
      </div>

      {/* Dynamic Form Draft Blocks List */}
      <div className="space-y-6">
        {drafts.map((draft, draftIdx) => {
          const isSubmitting = submittingDraftIds.has(draft.id);

          return (
            <div
              key={draft.id}
              className="glass-surface rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-amber-500/20 relative"
            >
              {/* Draft Block Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                    {draftIdx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    {draft.title.trim() ? draft.title : `New Artwork Draft #${draftIdx + 1}`}
                  </h3>
                </div>

                {drafts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    className="text-xs font-mono text-neutral-400 hover:text-red-400 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Remove this draft block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard Draft</span>
                  </button>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDraft(draft);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Artwork Title *
                    </label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) => updateDraft(draft.id, 'title', e.target.value)}
                      placeholder="e.g. Quantum Design System & Brand Identity"
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={draft.order}
                      onChange={(e) => updateDraft(draft.id, 'order', Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none font-mono min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Category (e.g. Branding, UI/UX, Poster, 3D)
                    </label>
                    <input
                      type="text"
                      value={draft.category}
                      onChange={(e) => updateDraft(draft.id, 'category', e.target.value)}
                      placeholder="e.g. Branding & Identity"
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                      Tools & Context (e.g. Figma, Illustrator)
                    </label>
                    <input
                      type="text"
                      value={draft.clientOrTool}
                      onChange={(e) => updateDraft(draft.id, 'clientOrTool', e.target.value)}
                      placeholder="e.g. Figma, Adobe Illustrator"
                      className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Description / Case Study Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(e) => updateDraft(draft.id, 'description', e.target.value)}
                    placeholder="Design philosophy, typography choices, color exploration, and delivered assets..."
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <ImageBlobUploader
                  idPrefix={`new-design-image-${draft.id}`}
                  label="Artwork Image (Base64 Blob Storage - Optional)"
                  helperText="Upload your design visual. It will be resized/compressed and stored as a base64 Blob directly in Firestore."
                  value={draft.imageUrl}
                  onChange={(newBlob) => updateDraft(draft.id, 'imageUrl', newBlob)}
                  previewShape="rectangle"
                  maxDimension={1200}
                  recommendedAspect="4:3"
                />

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    External Link / Portfolio URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={draft.projectUrl}
                    onChange={(e) => updateDraft(draft.id, 'projectUrl', e.target.value)}
                    placeholder="https://www.behance.net/gallery/... or Figma showcase"
                    className="w-full px-4 py-3 rounded-2xl glass-surface-subtle text-white text-sm focus:border-amber-400 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Primary Solid Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 hover:from-amber-400 hover:to-indigo-400 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer shadow-xl hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-98 disabled:opacity-50 min-h-[48px] touch-target"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>SAVING ARTWORK...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-white" />
                        <span>ADD GRAPHIC DESIGN TO REPOSITORY</span>
                      </>
                    )}
                  </button>

                  {/* Append Another Block Quick Button */}
                  <button
                    type="button"
                    onClick={addNewDraft}
                    className="px-4 py-3 rounded-2xl border border-amber-400/40 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ADD ANOTHER DRAFT</span>
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

      {/* Existing Designs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-400 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>STORED GRAPHIC DESIGNS ({designs.length})</span>
          </h3>
        </div>

        {designs.length === 0 ? (
          <div className="p-8 rounded-3xl glass-surface-subtle text-center text-xs font-mono text-neutral-400">
            NO GRAPHIC DESIGNS STORED IN FIRESTORE YET. USE THE FORM ABOVE TO ADD YOUR FIRST ARTWORK.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design) => (
              <div
                key={design.id}
                className="p-5 rounded-3xl glass-surface flex flex-col justify-between space-y-4 border border-white/10 group hover:border-amber-400/50 transition-all shadow-md hover:shadow-xl relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] w-full rounded-2xl bg-neutral-900 overflow-hidden relative">
                    {design.imageUrl ? (
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-500">
                        NO IMAGE
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/75 text-amber-300 text-[10px] font-mono font-semibold">
                        {design.category || 'Design'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                      <span>ORDER #{design.order}</span>
                      {design.clientOrTool && (
                        <span className="text-amber-400 truncate max-w-[120px]">
                          {design.clientOrTool}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight line-clamp-1">
                      {design.title}
                    </h4>
                    {design.description && (
                      <p className="text-xs text-neutral-300 line-clamp-2 mt-1 font-light leading-relaxed">
                        {design.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Controls */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startEdit(design)}
                      className="px-3 py-1.5 rounded-xl glass-surface-violet text-purple-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    {design.projectUrl && (
                      <a
                        href={design.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl glass-surface hover:text-white text-neutral-400 transition-colors"
                        title="External Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    disabled={deletingId === design.id}
                    onClick={() => handleDelete(design.id)}
                    className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Artwork"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
