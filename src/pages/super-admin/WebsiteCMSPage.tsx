import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  INITIAL_PROGRAMMES, 
  INITIAL_TEAM_CMS, 
  INITIAL_CAREERS, 
  INITIAL_APPLICATIONS, 
  INITIAL_ENQUIRIES 
} from '../../mock-data/msrf-data';
import { ProgrammeCMS, TeamCMS, CareerCMS, ContactEnquiryCMS } from '../../types';
import { Globe, Plus, Trash2, Edit3, Mail, MessageSquare, Briefcase, Users, Award, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const WebsiteCMSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('programmes');
  const { addToast } = useNotifications();

  // State
  const [programmes, setProgrammes] = useState<ProgrammeCMS[]>(INITIAL_PROGRAMMES);
  const [team, setTeam] = useState<TeamCMS[]>(INITIAL_TEAM_CMS);
  const [careers, setCareers] = useState<CareerCMS[]>(INITIAL_CAREERS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [enquiries, setEnquiries] = useState<ContactEnquiryCMS[]>(INITIAL_ENQUIRIES);

  // Modals
  const [progModal, setProgModal] = useState(false);
  const [teamModal, setTeamModal] = useState(false);
  const [careerModal, setCareerModal] = useState(false);

  // Form inputs
  const [progForm, setProgForm] = useState({ ageGroup: '6 - 10 YEARS', title: '', description: '' });
  const [teamForm, setTeamForm] = useState({ name: '', designation: 'DIRECTOR', biography: '' });
  const [careerForm, setCareerForm] = useState({ position: '', location: 'KOZHIKODE, KERALA', jobDescription: '', experienceRequired: '3+ Years' });

  const handleAddProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progForm.title) return;
    const newProg: ProgrammeCMS = {
      id: `prog-${Date.now()}`,
      ageGroup: progForm.ageGroup,
      title: progForm.title,
      description: progForm.description || 'Professional sports training program.',
      status: 'Active',
      enquiriesCount: 0
    };
    setProgrammes([newProg, ...programmes]);
    setProgForm({ ageGroup: '6 - 10 YEARS', title: '', description: '' });
    setProgModal(false);
    addToast({ type: 'success', title: 'Programme Published', message: newProg.title });
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name) return;
    const newTeam: TeamCMS = {
      id: `team-${Date.now()}`,
      name: teamForm.name,
      designation: teamForm.designation,
      initials: teamForm.name[0],
      biography: teamForm.biography,
      status: 'Active'
    };
    setTeam([...team, newTeam]);
    setTeamForm({ name: '', designation: 'DIRECTOR', biography: '' });
    setTeamModal(false);
    addToast({ type: 'success', title: 'Team Member Added', message: newTeam.name });
  };

  const handleAddCareer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerForm.position) return;
    const newJob: CareerCMS = {
      id: `job-${Date.now()}`,
      position: careerForm.position,
      location: careerForm.location,
      postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
      jobDescription: careerForm.jobDescription,
      experienceRequired: careerForm.experienceRequired,
      status: 'Open',
      applicationsCount: 0
    };
    setCareers([newJob, ...careers]);
    setCareerForm({ position: '', location: 'KOZHIKODE, KERALA', jobDescription: '', experienceRequired: '3+ Years' });
    setCareerModal(false);
    addToast({ type: 'success', title: 'Job Opening Posted', message: newJob.position });
  };

  const updateEnquiryStatus = (id: string, status: 'New' | 'Contacted' | 'Resolved') => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    addToast({ type: 'info', title: 'Enquiry Status Updated', message: `Marked as ${status}` });
  };

  return (
    <LayoutShell
      title="Website CMS & Dynamic Content Manager"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website Content' }]}
      actions={
        <Button
          size="sm"
          onClick={() => {
            if (activeTab === 'programmes') setProgModal(true);
            else if (activeTab === 'team') setTeamModal(true);
            else if (activeTab === 'careers') setCareerModal(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Entry
        </Button>
      }
    >
      <Tabs
        tabs={[
          { id: 'programmes', label: 'Programmes', badge: programmes.length },
          { id: 'team', label: 'Executive Team', badge: team.length },
          { id: 'careers', label: 'Careers', badge: careers.length },
          { id: 'applications', label: 'Job Applications', badge: applications.length },
          { id: 'enquiries', label: 'Contact Enquiries', badge: enquiries.filter(e => e.status === 'New').length }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* 1. Programmes Tab (Matching https://msrf-roan.vercel.app/programmes) */}
      {activeTab === 'programmes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-sm">Website Sports Programmes</h3>
              <p className="text-xs text-slate-400">Dynamic cards rendered on website for age-group admissions</p>
            </div>
            <Button size="sm" onClick={() => setProgModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Programme
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map(p => (
              <Card key={p.id} hoverEffect className="space-y-3 bg-slate-900 text-white border-slate-800">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest block">
                  {p.ageGroup}
                </span>
                <h3 className="text-lg font-black text-white">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{p.description}</p>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold">{p.enquiriesCount} Enquiries</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-rose-400"
                      onClick={() => setProgrammes(programmes.filter(x => x.id !== p.id))}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. Team Tab (Matching https://msrf-roan.vercel.app/about) */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-sm">Leadership & Board Members</h3>
              <p className="text-xs text-slate-400">Chairman, Directors, and CEO profiles on website</p>
            </div>
            <Button size="sm" onClick={() => setTeamModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Board Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map(t => (
              <Card key={t.id} hoverEffect className="space-y-4 bg-slate-900 text-white border-slate-800">
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl font-mono font-black text-slate-500 mx-auto">
                  {t.initials || t.name[0]}
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                    {t.designation}
                  </span>
                  <h3 className="text-base font-black text-white">{t.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{t.biography}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-rose-400"
                    onClick={() => setTeam(team.filter(x => x.id !== t.id))}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. Careers Tab (Matching https://msrf-roan.vercel.app/career) */}
      {activeTab === 'careers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-sm">Career Opportunities</h3>
              <p className="text-xs text-slate-400">Job postings displayed on public Career page</p>
            </div>
            <Button size="sm" onClick={() => setCareerModal(true)} icon={<Plus className="w-4 h-4" />}>
              Post Job Opening
            </Button>
          </div>

          <div className="space-y-4">
            {careers.map(c => (
              <Card key={c.id} className="bg-slate-900 text-white border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-white">{c.position}</h3>
                    <Badge variant={c.status === 'Open' ? 'active' : 'inactive'}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-slate-400">
                    📍 {c.location} • POSTED: {c.postedDate}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 max-w-2xl">{c.jobDescription}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-emerald-400 font-bold">{c.applicationsCount} Applicants</span>
                  <Button
                    size="sm"
                    variant={c.status === 'Open' ? 'primary' : 'secondary'}
                    onClick={() => setCareers(careers.map(x => x.id === c.id ? { ...x, status: x.status === 'Open' ? 'Closed' : 'Open' } : x))}
                  >
                    {c.status === 'Open' ? 'Close Position' : 'Reopen Job'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 4. Job Applications Tab */}
      {activeTab === 'applications' && (
        <Card header={<h3 className="font-bold text-slate-900 text-sm">Job Applications Submissions</h3>}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-3">Applicant Name</th>
                  <th className="py-3 px-3">Applied Position</th>
                  <th className="py-3 px-3">Contact Email & Phone</th>
                  <th className="py-3 px-3">Applied Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Resume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{app.applicantName}</td>
                    <td className="py-3.5 px-3 font-bold text-blue-600">{app.position}</td>
                    <td className="py-3.5 px-3 text-slate-600">{app.email} • {app.phone}</td>
                    <td className="py-3.5 px-3 text-slate-500">{app.appliedDate}</td>
                    <td className="py-3.5 px-3">
                      <Badge variant={app.status === 'Shortlisted' ? 'active' : 'pending'}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => addToast({ type: 'info', title: 'Resume Download', message: `Opening resume for ${app.applicantName}` })}>
                        View Resume
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. Contact Enquiries Tab */}
      {activeTab === 'enquiries' && (
        <Card header={<h3 className="font-bold text-slate-900 text-sm">Website Contact & Programme Enquiries</h3>}>
          <div className="space-y-3">
            {enquiries.map(enq => (
              <div key={enq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{enq.name}</span>
                    <Badge variant={enq.status === 'New' ? 'pending' : 'active'}>{enq.status}</Badge>
                  </div>
                  <p className="text-slate-600 font-semibold">{enq.programmeOrSubject}</p>
                  <p className="text-slate-500">"{enq.message}"</p>
                  <p className="text-[11px] text-slate-400">Phone: {enq.phone} • Email: {enq.email} • {enq.submittedDate}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {enq.status === 'New' && (
                    <Button size="sm" variant="success" onClick={() => updateEnquiryStatus(enq.id, 'Contacted')}>
                      Mark Contacted
                    </Button>
                  )}
                  {enq.status !== 'Resolved' && (
                    <Button size="sm" variant="outline" onClick={() => updateEnquiryStatus(enq.id, 'Resolved')}>
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Programme Modal */}
      <Modal isOpen={progModal} onClose={() => setProgModal(false)} title="Add Website Sports Programme">
        <form onSubmit={handleAddProgramme} className="space-y-4">
          <Select
            label="Target Age Group"
            options={[
              { label: '6 - 10 YEARS', value: '6 - 10 YEARS' },
              { label: '11 - 14 YEARS', value: '11 - 14 YEARS' },
              { label: '15 - 18 YEARS', value: '15 - 18 YEARS' },
              { label: '10 - 18 YEARS', value: '10 - 18 YEARS' },
              { label: '8 - 16 YEARS', value: '8 - 16 YEARS' },
              { label: '14 YEARS AND ABOVE', value: '14 YEARS AND ABOVE' }
            ]}
            value={progForm.ageGroup}
            onChange={e => setProgForm({ ...progForm, ageGroup: e.target.value })}
          />
          <Input label="Programme Title" required value={progForm.title} onChange={e => setProgForm({ ...progForm, title: e.target.value })} placeholder="e.g. Grassroots Kids Football" />
          <div>
            <label className="text-xs font-semibold text-slate-700">Programme Description</label>
            <textarea
              rows={3}
              value={progForm.description}
              onChange={e => setProgForm({ ...progForm, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="A fun-first program introducing ball mastery..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setProgModal(false)}>Cancel</Button>
            <Button type="submit">Publish Programme</Button>
          </div>
        </form>
      </Modal>

      {/* Board Member Modal */}
      <Modal isOpen={teamModal} onClose={() => setTeamModal(false)} title="Add Board / Leadership Member">
        <form onSubmit={handleAddTeam} className="space-y-4">
          <Input label="Full Name" required value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="e.g. John Doe" />
          <Select
            label="Designation"
            options={[
              { label: 'CHAIRMAN', value: 'CHAIRMAN' },
              { label: 'DIRECTOR', value: 'DIRECTOR' },
              { label: 'MANAGING DIRECTOR & CEO', value: 'MANAGING DIRECTOR & CEO' },
              { label: 'GENERAL SECRETARY', value: 'GENERAL SECRETARY' }
            ]}
            value={teamForm.designation}
            onChange={e => setTeamForm({ ...teamForm, designation: e.target.value })}
          />
          <div>
            <label className="text-xs font-semibold text-slate-700">Biography / Title Subtext</label>
            <textarea
              rows={2}
              value={teamForm.biography}
              onChange={e => setTeamForm({ ...teamForm, biography: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="e.g. Former Chief Secretary to the Government of Goa"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setTeamModal(false)}>Cancel</Button>
            <Button type="submit">Save Board Member</Button>
          </div>
        </form>
      </Modal>

      {/* Job Opening Modal */}
      <Modal isOpen={careerModal} onClose={() => setCareerModal(false)} title="Post Career Opening">
        <form onSubmit={handleAddCareer} className="space-y-4">
          <Input label="Job Position Title" required value={careerForm.position} onChange={e => setCareerForm({ ...careerForm, position: e.target.value })} placeholder="e.g. Academy Head Coach" />
          <Input label="Location" value={careerForm.location} onChange={e => setCareerForm({ ...careerForm, location: e.target.value })} />
          <Input label="Experience Required" value={careerForm.experienceRequired} onChange={e => setCareerForm({ ...careerForm, experienceRequired: e.target.value })} placeholder="e.g. 5+ Years (AFC / UEFA License)" />
          <div>
            <label className="text-xs font-semibold text-slate-700">Job Description</label>
            <textarea
              rows={3}
              value={careerForm.jobDescription}
              onChange={e => setCareerForm({ ...careerForm, jobDescription: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="Lead technical development of youth teams..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCareerModal(false)}>Cancel</Button>
            <Button type="submit">Post Job Opening</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
