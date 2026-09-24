import React, { useState } from 'react';
import { LayoutShell } from '../../../components/layout/LayoutShell';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { INITIAL_APPLICATIONS } from '../../../mock-data/msrf-data';
import { CareerApplicationCMS } from '../../../types';
import { Edit3, Trash2, Eye, Download, FileText, ExternalLink, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

export const JobApplicationsCMSPage: React.FC = () => {
  const [applications, setApplications] = useState<CareerApplicationCMS[]>(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [detailModalApp, setDetailModalApp] = useState<CareerApplicationCMS | null>(null);
  const [editingApp, setEditingApp] = useState<CareerApplicationCMS | null>(null);
  const [deletingApp, setDeletingApp] = useState<CareerApplicationCMS | null>(null);

  const [form, setForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    position: '',
    status: 'Under Review' as 'Under Review' | 'Shortlisted' | 'Rejected'
  });

  const { addToast } = useNotifications();

  const filtered = applications.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.position.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenEdit = (app: CareerApplicationCMS) => {
    setEditingApp(app);
    setForm({
      applicantName: app.applicantName,
      email: app.email,
      phone: app.phone,
      position: app.position,
      status: app.status
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setApplications(prev =>
      prev.map(a =>
        a.id === editingApp.id
          ? { ...a, applicantName: form.applicantName, email: form.email, phone: form.phone, position: form.position, status: form.status }
          : a
      )
    );

    setEditingApp(null);
    if (detailModalApp && detailModalApp.id === editingApp.id) {
      setDetailModalApp(prev => prev ? { ...prev, ...form } : null);
    }
    addToast({ type: 'success', title: 'Application Updated', message: form.applicantName });
  };

  const handleStatusChange = (id: string, newStatus: 'Under Review' | 'Shortlisted' | 'Rejected') => {
    setApplications(prev => prev.map(a => (a.id === id ? { ...a, status: newStatus } : a)));
    if (detailModalApp && detailModalApp.id === id) {
      setDetailModalApp(prev => prev ? { ...prev, status: newStatus } : null);
    }
    addToast({ type: 'info', title: 'Status Updated', message: `Application status set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingApp) return;
    setApplications(prev => prev.filter(a => a.id !== deletingApp.id));
    addToast({ type: 'info', title: 'Application Deleted', message: `Application for ${deletingApp.applicantName} removed.` });
    setDeletingApp(null);
    if (detailModalApp && detailModalApp.id === deletingApp.id) {
      setDetailModalApp(null);
    }
  };

  const handleDownloadCV = (app: CareerApplicationCMS) => {
    const filename = app.resumeFileName || `${app.applicantName.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`;
    const link = document.createElement('a');
    link.href = app.resumeUrl && app.resumeUrl !== '#' ? app.resumeUrl : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'CV Download Started', message: `Downloading ${filename}` });
  };

  return (
    <LayoutShell
      title="Job Application Submissions"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Job Applications' }]}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applicant name, email, position..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Status', value: 'all' },
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Shortlisted', value: 'Shortlisted' },
              { label: 'Rejected', value: 'Rejected' }
            ]
          }
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No Applications Found" description="No job applications match your search query." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Applied Position</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Uploaded CV / Resume</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(app => {
                  const cvName = app.resumeFileName || `${app.applicantName.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        <button
                          onClick={() => setDetailModalApp(app)}
                          className="hover:text-blue-600 cursor-pointer text-left focus:outline-none"
                        >
                          {app.applicantName}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{app.position}</td>
                      <td className="py-3.5 px-4 text-slate-600">{app.email} • {app.phone}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-rose-50 text-rose-600 font-mono text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> PDF
                          </span>
                          <button
                            onClick={() => handleDownloadCV(app)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline flex items-center gap-1 cursor-pointer"
                            title="Download CV"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="max-w-[120px] truncate">{cvName}</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{app.appliedDate}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={app.status}
                          onChange={e => handleStatusChange(app.id, e.target.value as any)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors ${
                            app.status === 'Shortlisted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Eye className="w-3.5 h-3.5 text-slate-600" />}
                            onClick={() => setDetailModalApp(app)}
                            title="View Detailed Profile"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                            onClick={() => handleOpenEdit(app)}
                            title="Edit Application"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-500 hover:bg-rose-50"
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => setDeletingApp(app)}
                            title="Delete Application"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingApp}
        onClose={() => setDeletingApp(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingApp?.applicantName}
      />

      {/* Job Application Detailed Modal */}
      {detailModalApp && (
        <Modal
          isOpen={!!detailModalApp}
          onClose={() => setDetailModalApp(null)}
          title={`Job Application: ${detailModalApp.applicantName}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header section with status selector */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-blue-400">APPLICANT PROFILE</span>
                <h3 className="text-xl font-black text-white">{detailModalApp.applicantName}</h3>
                <p className="text-xs text-slate-300 font-bold mt-0.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span>{detailModalApp.position}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Status:</span>
                <select
                  value={detailModalApp.status}
                  onChange={e => handleStatusChange(detailModalApp.id, e.target.value as any)}
                  className={`text-xs font-bold rounded-lg px-3 py-1.5 border cursor-pointer focus:outline-none ${
                    detailModalApp.status === 'Shortlisted'
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : detailModalApp.status === 'Rejected'
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-amber-500 text-white border-amber-400'
                  }`}
                >
                  <option value="Under Review" className="bg-slate-900 text-white">Under Review</option>
                  <option value="Shortlisted" className="bg-slate-900 text-white">Shortlisted</option>
                  <option value="Rejected" className="bg-slate-900 text-white">Rejected</option>
                </select>
              </div>
            </div>

            {/* Applicant Contact & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</p>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{detailModalApp.email}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone Number</p>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{detailModalApp.phone}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Applied Position</p>
                <p className="font-extrabold text-blue-600">{detailModalApp.position}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Application Date</p>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{detailModalApp.appliedDate}</span>
                </p>
              </div>
            </div>

            {/* Uploaded CV Card with Preview & Download */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Website Uploaded Candidate CV / Resume</h4>
                    <p className="text-[11px] font-mono text-slate-500">
                      {detailModalApp.resumeFileName || `${detailModalApp.applicantName.toLowerCase().replace(/\s+/g, '_')}_cv.pdf`} • 1.8 MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const url = detailModalApp.resumeUrl && detailModalApp.resumeUrl !== '#' ? detailModalApp.resumeUrl : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
                      window.open(url, '_blank');
                    }}
                  >
                    View CV
                  </Button>

                  <Button
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownloadCV(detailModalApp)}
                  >
                    Download CV
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDetailModalApp(null)}>
                Close Modal
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { const app = detailModalApp; setDetailModalApp(null); handleOpenEdit(app); }}>
                  Edit Details
                </Button>
                <Button onClick={() => setDetailModalApp(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Application Modal */}
      {editingApp && (
        <Modal isOpen={!!editingApp} onClose={() => setEditingApp(null)} title="Edit Job Application">
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input label="Applicant Name" required value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })} />
            <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone Number" isPhone value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Applied Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
            <Select
              label="Application Status"
              options={[
                { label: 'Under Review', value: 'Under Review' },
                { label: 'Shortlisted', value: 'Shortlisted' },
                { label: 'Rejected', value: 'Rejected' }
              ]}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as any })}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setEditingApp(null)}>Cancel</Button>
              <Button type="submit">Update Application</Button>
            </div>
          </form>
        </Modal>
      )}
    </LayoutShell>
  );
};
