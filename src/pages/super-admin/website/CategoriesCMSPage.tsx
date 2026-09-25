import React, { useState } from 'react';
import { LayoutShell } from '../../../components/layout/LayoutShell';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Pagination } from '../../../components/ui/Pagination';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { StatusToggle } from '../../../components/ui/StatusToggle';
import { EmptyState } from '../../../components/ui/EmptyState';
import { INITIAL_CATEGORIES } from '../../../mock-data/msrf-data';
import { CategoryCMS } from '../../../types';
import { Plus, Trash2, Pencil, Tag } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

export const CategoriesCMSPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryCMS[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryCMS | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryCMS | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: ''
  });

  const { addToast } = useNotifications();

  const filtered = categories.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm({ title: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: CategoryCMS) => {
    setEditingCategory(c);
    setForm({ title: c.title, description: c.description });
    setModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingCategory) {
      setCategories(prev =>
        prev.map(c =>
          c.id === editingCategory.id
            ? { ...c, title: form.title, description: form.description }
            : c
        )
      );
      addToast({ type: 'success', title: 'Category Updated', message: form.title });
    } else {
      const newCat: CategoryCMS = {
        id: `cat-${Date.now()}`,
        title: form.title,
        description: form.description || 'Sports academy category module.',
        status: 'Active',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setCategories([newCat, ...categories]);
      addToast({ type: 'success', title: 'Category Added', message: newCat.title });
    }

    setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
    addToast({ type: 'info', title: 'Status Updated', message: `Category status set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;
    setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
    addToast({ type: 'info', title: 'Category Removed', message: `"${deletingCategory.title}" removed.` });
    setDeletingCategory(null);
  };

  return (
    <LayoutShell
      title="Category Management"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Categories' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add New Category
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'All Status', value: 'all' }
            ]
          }
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No Categories Found" description="No category records match your search." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span>{c.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{c.description}</td>
                    <td className="py-3.5 px-4">
                      <StatusToggle
                        status={c.status || 'Active'}
                        onChange={newStatus => handleStatusChange(c.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingCategory(c)} />
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
          {paginatedData.map(c => (
            <Card key={c.id} hoverEffect className="space-y-3 bg-white border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Tag className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">{c.title}</h3>
                </div>
                <StatusToggle
                  status={c.status || 'Active'}
                  onChange={newStatus => handleStatusChange(c.id, newStatus)}
                />
              </div>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{c.description}</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1 text-xs">
                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(c)} />
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingCategory(c)} />
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingCategory?.title}
      />

      {/* Add / Edit Category Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Title"
            required
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Football Academy"
          />
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Category Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="e.g. Youth grassroots & elite football development programs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingCategory ? "Update Category" : "Save Category"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
