import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { 
  FiPlus, FiTrash2, FiEdit2, FiCalendar, FiUsers, FiX, 
  FiImage, FiType, FiFileText, FiUser, FiTag, FiMoreVertical, FiMinusCircle, FiSave, FiClock, FiActivity
} from 'react-icons/fi';

const ManageElections = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- MOCK DATA (Active/Scheduled Only) ---
  const [elections, setElections] = useState([
    { 
      id: 1, 
      title: 'Student Council President', 
      date: '2024-10-25', 
      startTime: '09:00',
      endTime: '17:00',
      description: 'Annual election for the student body president.',
      status: 'Active', 
      image: null,
      candidates: [
        { name: 'Sarah Jenkins', designation: 'Future Vision' },
        { name: 'Michael Chen', designation: 'Tech Forward' },
        { name: 'David Ross', designation: 'Student Voice' }
      ]
    },
    { 
      id: 2, 
      title: 'Department Representative', 
      date: '2024-11-01', 
      startTime: '10:00',
      endTime: '16:00',
      description: 'Electing the CS department representative.',
      status: 'Active', 
      image: null,
      candidates: [
        { name: 'Emily Blunt', designation: 'Code Warriors' },
        { name: 'John Krasinski', designation: 'AI Alliance' }
      ]
    },
  ]);

  // --- FORM STATE ---
  const initialFormState = {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    image: null,
    candidates: [
      { name: '', designation: '' },
      { name: '', designation: '' }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- CANDIDATE LOGIC ---
  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...formData.candidates];
    updatedCandidates[index][field] = value;
    setFormData({ ...formData, candidates: updatedCandidates });
  };

  const addCandidateSlot = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, { name: '', designation: '' }]
    });
  };

  const removeCandidateSlot = (index) => {
    if (formData.candidates.length <= 2) {
      alert("An election requires at least 2 candidates.");
      return;
    }
    const updatedCandidates = formData.candidates.filter((_, i) => i !== index);
    setFormData({ ...formData, candidates: updatedCandidates });
  };

  // --- GENERAL HANDLERS ---
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0].name });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      setElections(elections.filter(e => e.id !== id));
    }
  };

  const openEditModal = (election) => {
    setEditingId(election.id);
    setFormData({
      title: election.title,
      date: election.date,
      startTime: election.startTime,
      endTime: election.endTime,
      description: election.description,
      image: election.image,
      candidates: [...election.candidates] 
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Validation
    const validCandidates = formData.candidates.filter(c => c.name.trim() !== '');
    if (validCandidates.length < 2) {
      alert("Please enter at least 2 valid candidate names.");
      return;
    }
    if (!formData.title || !formData.date) {
        alert("Title and Date are required.");
        return;
    }

    if (editingId) {
      // Update Existing
      setElections(elections.map(ele => ele.id === editingId ? {
        ...ele,
        ...formData,
        candidates: validCandidates
      } : ele));
    } else {
      // Create New
      const newElection = {
        id: Date.now(),
        ...formData,
        status: 'Active', // Default status
        candidates: validCandidates
      };
      setElections([...elections, newElection]);
    }

    setShowModal(false);
  };

  return (
    <AdminLayout>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Election Management</h1>
          <p className="text-slate-400 text-sm mt-1">Configure and launch live voting sessions.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={openCreateModal}
          className="bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 gap-2 w-full md:w-auto"
        >
          <FiPlus className="w-5 h-5" /> New Election
        </Button>
      </div>

      {/* --- ELECTIONS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
        {elections.map((election) => (
          <div key={election.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden group hover:border-rose-500/30 transition-all hover:shadow-xl hover:shadow-black/20 flex flex-col">
            
            {/* Card Header / Banner */}
            <div className="h-32 bg-slate-800 relative group-hover:bg-slate-700/50 transition-colors flex items-center justify-center">
              {election.image ? (
                 <div className="text-slate-500 text-xs">{election.image}</div> 
              ) : (
                 <FiActivity className="text-slate-700 w-12 h-12 group-hover:text-rose-500/20 transition-colors" />
              )}
              
              {/* Active Badge */}
              <div className="absolute top-4 right-4">
                 <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white leading-tight line-clamp-2" title={election.title}>
                    {election.title}
                </h3>
              </div>
              
              <div className="space-y-3 text-xs text-slate-400 mt-1 flex-1">
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                  <FiCalendar className="w-3.5 h-3.5 text-rose-400" /> 
                  <span>{election.date}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                  <FiClock className="w-3.5 h-3.5 text-rose-400" /> 
                  <span>{election.startTime} - {election.endTime}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                  <FiUsers className="w-3.5 h-3.5 text-rose-400" /> 
                  <span>{election.candidates.length} Candidates Registered</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex gap-3">
                <button 
                  onClick={() => openEditModal(election)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-700/30 text-slate-300 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-transparent hover:border-indigo-400/50"
                >
                  <FiEdit2 className="w-3.5 h-3.5" /> Manage
                </button>
                <button 
                  onClick={() => handleDelete(election.id)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-transparent hover:border-red-400/50"
                  title="Delete Election"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty State Helper */}
        {elections.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                <p>No active elections found. Create one to get started.</p>
            </div>
        )}
      </div>

      {/* --- UNIVERSAL MODAL (CREATE & EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl animate-slide-up relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingId ? <FiEdit2 className="text-rose-500" /> : <FiPlus className="text-rose-500" />}
                {editingId ? "Update Election Details" : "Launch New Election"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-slate-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Image Upload */}
              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Election Banner</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-rose-500/50 hover:bg-slate-800/50 transition-all cursor-pointer relative">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                       <FiImage className="text-slate-400 group-hover:text-rose-400 w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{formData.image ? formData.image : "Click to upload banner image"}</p>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <Input 
                  label="Election Title" 
                  placeholder="e.g. Student Council 2026" 
                  icon={FiType}
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input 
                    label="Date" 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                   />
                   <div className="grid grid-cols-2 gap-2">
                     <Input 
                       label="Start Time" type="time" 
                       value={formData.startTime} 
                       onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                     />
                     <Input 
                       label="End Time" type="time" 
                       value={formData.endTime} 
                       onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                     />
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Description</label>
                  <div className="relative">
                    <FiFileText className="absolute top-3 left-3 text-slate-500" />
                    <textarea 
                      rows="2"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all placeholder:text-slate-600"
                      placeholder="Brief details about this election..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* DYNAMIC CANDIDATE SECTION */}
              <div className="border-t border-slate-700/50 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-white flex items-center gap-2">
                       <FiUsers className="text-rose-400" /> Candidates
                       <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">Min: 2</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={addCandidateSlot}
                      className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors hover:bg-emerald-500/20"
                    >
                      <FiPlus className="w-3 h-3" /> Add Slot
                    </button>
                </div>

                <div className="space-y-3">
                  {formData.candidates.map((candidate, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 animate-fade-in group hover:border-slate-600 transition-colors">
                      
                      <div className="flex-1 w-full">
                        <div className="relative">
                          <FiUser className="absolute top-3 left-3 text-slate-500 group-hover:text-white transition-colors" />
                          <input
                            type="text"
                            placeholder={`Candidate ${index + 1} Name`}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-rose-500 focus:outline-none transition-all placeholder:text-slate-600 focus:bg-slate-900"
                            value={candidate.name}
                            onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <div className="relative">
                          <FiTag className="absolute top-3 left-3 text-slate-500 group-hover:text-white transition-colors" />
                          <input
                            type="text"
                            placeholder="Designation (Optional)"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-rose-500 focus:outline-none transition-all placeholder:text-slate-600 focus:bg-slate-900"
                            value={candidate.designation}
                            onChange={(e) => handleCandidateChange(index, 'designation', e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeCandidateSlot(index)}
                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors self-end sm:self-auto border border-transparent hover:border-red-500/20"
                        title="Remove Candidate"
                      >
                        <FiMinusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-700 bg-slate-800/30 rounded-b-2xl flex gap-3">
              <Button variant="ghost" className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => setShowModal(false)}>
                Discard
              </Button>
              <Button variant="primary" className="flex-1 bg-rose-600 hover:bg-rose-500 shadow-rose-500/20" onClick={handleSave}>
                {editingId ? (
                   <><FiSave className="w-4 h-4 mr-2 inline" /> Update Changes</>
                ) : (
                   "Publish Election"
                )}
              </Button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageElections;