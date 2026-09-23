import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { FilterBar } from '../../components/ui/FilterBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { ImageLightboxModal } from '../../components/ui/ImageLightboxModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { EmptyState } from '../../components/ui/EmptyState';
import { INITIAL_GALLERY } from '../../mock-data/msrf-data';
import { GalleryItemCMS, GalleryCategory } from '../../types';
import { Plus, Trash2, Edit3, Eye } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const GalleryManagementPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItemCMS[]>(INITIAL_GALLERY);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [uploadModal, setUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemCMS | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItemCMS | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Form state (No status field needed in form - default always Active)
  const [form, setForm] = useState({
    title: '',
    category: 'Argentina' as GalleryCategory,
    imageUrl: '',
    caption: ''
  });

  const { addToast } = useNotifications();

  const filtered = items.filter(i => {
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.caption.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({ title: '', category: 'Argentina', imageUrl: '', caption: '' });
    setUploadModal(true);
  };

  const handleOpenEdit = (item: GalleryItemCMS) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      caption: item.caption
    });
    setUploadModal(true);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const imgUrlToUse =
      form.imageUrl ||
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800';

    if (editingItem) {
      setItems(prev =>
        prev.map(i =>
          i.id === editingItem.id
            ? { ...i, title: form.title, category: form.category, imageUrl: imgUrlToUse, caption: form.caption || form.title }
            : i
        )
      );
      addToast({ type: 'success', title: 'Gallery Photo Updated', message: form.title });
    } else {
      const newItem: GalleryItemCMS = {
        id: `gal-${Date.now()}`,
        title: form.title,
        category: form.category,
        imageUrl: imgUrlToUse,
        uploadedDate: new Date().toISOString().slice(0, 10),
        caption: form.caption || form.title,
        status: 'Active'
      };
      setItems([newItem, ...items]);
      addToast({ type: 'success', title: 'Gallery Photo Published', message: form.title });
    }

    setUploadModal(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status: newStatus } : i)));
    addToast({ type: 'info', title: 'Status Updated', message: `Gallery item set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    addToast({ type: 'info', title: 'Photo Deleted', message: `"${deletingItem.title}" removed.` });
    setDeletingItem(null);
  };

  return (
    <LayoutShell
      title="Website Photo Gallery CMS"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Gallery' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Upload Gallery Photo
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search photo title or category..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={[
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'all' },
              { label: 'Argentina Delegation', value: 'Argentina' },
              { label: 'Training', value: 'Training' },
              { label: 'Matches', value: 'Matches' },
              { label: 'Events', value: 'Events' },
              { label: 'Infrastructure', value: 'Infrastructure' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]
          }
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No Photos Found" description="No gallery photos match your search settings." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Photo Preview</th>
                  <th className="py-3 px-4">Title & Caption</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Uploaded Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(img => (
                  <tr key={img.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <img
                        src={img.imageUrl}
                        alt={img.title}
                        onClick={() => setLightboxImg({ url: img.imageUrl, title: img.title, caption: img.caption })}
                        className="w-16 h-12 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-extrabold text-slate-900 text-sm">{img.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{img.caption}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="blue">{img.category}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{img.uploadedDate}</td>
                    <td className="py-3.5 px-4">
                      <StatusToggle
                        status={img.status || 'Active'}
                        onChange={newStatus => handleStatusChange(img.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setLightboxImg({ url: img.imageUrl, title: img.title, caption: img.caption })} />
                        <Button size="sm" variant="ghost" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(img)} />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingItem(img)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map(img => (
            <Card key={img.id} hoverEffect className="p-0 overflow-hidden space-y-3 bg-white border border-slate-200">
              <div className="relative">
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  onClick={() => setLightboxImg({ url: img.imageUrl, title: img.title, caption: img.caption })}
                  className="w-full h-52 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-600 text-white rounded-md shadow-xs">
                    {img.category}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">{img.title}</h4>
                  <StatusToggle
                    status={img.status || 'Active'}
                    onChange={newStatus => handleStatusChange(img.id, newStatus)}
                  />
                </div>
                <p className="text-xs text-slate-500">{img.caption}</p>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-400">Uploaded: {img.uploadedDate}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(img)} />
                    <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingItem(img)} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxImg}
        onClose={() => setLightboxImg(null)}
        imageUrl={lightboxImg?.url || ''}
        title={lightboxImg?.title}
        caption={lightboxImg?.caption}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.title}
      />

      {/* Upload / Edit Modal */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} title={editingItem ? "Edit Gallery Photo" : "Upload Media Gallery Photo"}>
        <form onSubmit={handleSavePhoto} className="space-y-4">
          <Input label="Photo Title / Caption" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Argentinos Juniors delegation visit" />
          
          <Select
            label="Category Tag"
            options={[
              { label: 'Argentina Delegation', value: 'Argentina' },
              { label: 'Training Sessions', value: 'Training' },
              { label: 'Matches', value: 'Matches' },
              { label: 'Events & Convocation', value: 'Events' },
              { label: 'Infrastructure', value: 'Infrastructure' }
            ]}
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value as GalleryCategory })}
          />

          <ImageUpload
            label="Gallery Photo Image"
            value={form.imageUrl}
            onChange={url => setForm({ ...form, imageUrl: url })}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setUploadModal(false)}>Cancel</Button>
            <Button type="submit">{editingItem ? "Update Photo" : "Publish to Gallery"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
