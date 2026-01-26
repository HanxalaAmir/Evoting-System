import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCalendar,
  FiUsers,
  FiX,
  FiType,
  FiMinusCircle,
  FiClock,
  FiActivity,
  FiLayers,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { electionAPI } from "../../services/api";

// --- EXTERNAL INPUT COMPONENT (Prevents Focus Loss) ---
const SimpleInput = ({ label, icon: Icon, ...props }) => (
  <div>
    {label && (
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && <Icon className="absolute top-3.5 left-4 text-slate-500" />}
      <input
        {...props}
        className={`w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 ${Icon ? "pl-10" : "pl-4"} pr-4 text-sm text-white focus:border-rose-500 outline-none transition-colors`}
      />
    </div>
  </div>
);

const ManageElections = () => {
  // --- STATE ---
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // --- FORM STATE ---
  const initialFormState = {
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0], // Default to Today
    startTime: "00:00", // Default Start
    endDate: new Date().toISOString().split("T")[0], // Default to Today
    endTime: "00:00", // Default End
    candidates: [
      { name: "", designation: "" },
      { name: "", designation: "" },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- FETCH DATA (With Polling) ---
  const fetchElections = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      const response = await electionAPI.getAll();
      setElections(response.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (showLoading) setError("Failed to load elections.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections(true);
    const interval = setInterval(() => {
      fetchElections(false);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...formData.candidates];
    updatedCandidates[index][field] = value;
    setFormData({ ...formData, candidates: updatedCandidates });
  };

  const addCandidateSlot = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, { name: "", designation: "" }],
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election?"))
      return;
    try {
      await electionAPI.delete(id);
      setElections(elections.filter((e) => e.id !== id));
    } catch (err) {
      alert("Failed to delete election.");
    }
  };

  // --- HELPER: PARSE DB UTC TIME ---
  const parseDatabaseTime = (isoString) => {
    if (!isoString) return { date: "", time: "" };
    const [datePart, timePart] = isoString.split("T");
    const time = timePart.substring(0, 5); // Take "05:00"
    return { date: datePart, time: time };
  };

  const openEditModal = (election) => {
    setEditingId(election.id);

    const start = parseDatabaseTime(election.start_time);
    const end = parseDatabaseTime(election.end_time);

    setFormData({
      title: election.title,
      description: election.description || "",
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      candidates: [...election.candidates],
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const validCandidates = formData.candidates.filter(
      (c) => c.name.trim() !== "",
    );

    if (validCandidates.length < 2)
      return alert("Please enter at least 2 valid candidates.");
    if (!formData.title || !formData.startDate || !formData.startTime)
      return alert("Title and Start Time are required.");

    setIsSaving(true);
    try {
      const startDateTime = `${formData.startDate}T${formData.startTime}:00Z`;
      const endDateTime = `${formData.endDate}T${formData.endTime}:00Z`;

      const payload = {
        title: formData.title,
        description: formData.description,
        startTime: startDateTime,
        endTime: endDateTime,
        candidates: validCandidates,
      };

      if (editingId) {
        await electionAPI.update(editingId, payload);
      } else {
        await electionAPI.create(payload);
      }

      setShowModal(false);
      fetchElections(true);
    } catch (err) {
      console.error("Save Error:", err);
      alert(err.response?.data?.message || "Failed to save election.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-slate-800 pb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/20">
                <FiLayers className="text-white w-6 h-6" />
              </div>
              Election Management
            </h1>
            <p className="text-slate-400 text-sm mt-3 ml-1 max-w-xl">
              Configure, schedule, and manage voting sessions. Status updates
              automatically.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 font-semibold text-sm w-full md:w-auto"
          >
            <FiPlus className="w-5 h-5" /> Create New Election
          </button>
        </div>

        {/* --- ERROR STATE --- */}
        {error && (
          <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-8 text-center mb-8 animate-fade-in flex flex-col items-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-3">
              <FiAlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Connection Error
            </h3>
            <p className="text-slate-400 mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchElections(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm font-bold"
            >
              <FiRefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* --- LOADING STATE --- */}
        {isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FiLoader className="w-10 h-10 animate-spin mb-4 text-rose-500" />
            <p>Syncing elections...</p>
          </div>
        )}

        {/* --- GRID --- */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {elections.map((election) => (
              <div
                key={election.id}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden group hover:border-rose-500/30 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col relative"
              >
                {/* Banner Area */}
                <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center border-b border-slate-700/50">
                  <div className="absolute inset-0 bg-slate-900/50"></div>
                  <FiActivity className="text-slate-700 w-12 h-12 relative z-10 group-hover:text-rose-500/20 transition-colors duration-500" />
                  <div className="absolute top-4 right-4 z-20">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border backdrop-blur-md flex items-center gap-1.5 ${
                        election.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : election.status === "Ended"
                            ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          election.status === "Active"
                            ? "bg-emerald-500 animate-pulse"
                            : election.status === "Ended"
                              ? "bg-slate-500"
                              : "bg-amber-500"
                        }`}
                      ></span>
                      {election.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col relative z-10 -mt-6">
                  <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl shadow-lg mb-4">
                    <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 mb-1">
                      {election.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      ID: {election.id}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-slate-400 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
                        <FiCalendar className="text-rose-400" />
                      </div>
                      <span>
                        {new Date(election.start_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
                        <FiClock className="text-rose-400" />
                      </div>
                      <span>
                        {new Date(election.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(election.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-800 rounded border border-slate-700">
                        <FiUsers className="text-rose-400" />
                      </div>
                      <span>
                        {election.candidates ? election.candidates.length : 0}{" "}
                        Candidates Registered
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/50 flex gap-3">
                    <button
                      onClick={() => openEditModal(election)}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-indigo-500/20 hover:border-indigo-500"
                    >
                      <FiEdit2 /> Manage
                    </button>
                    <button
                      onClick={() => handleDelete(election.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20 hover:border-red-500"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {elections.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 border-dashed">
                  <FiPlus className="text-slate-600 w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">
                  No elections found. Start by creating one.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- MODAL --- */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl animate-slide-up relative flex flex-col my-auto">
              <div className="p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingId ? (
                    <FiEdit2 className="text-rose-500" />
                  ) : (
                    <FiPlus className="text-rose-500" />
                  )}
                  {editingId
                    ? "Update Election Details"
                    : "Launch New Election"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                {/* Basic Fields */}
                <div className="space-y-4">
                  <SimpleInput
                    label="Title"
                    icon={FiType}
                    placeholder="e.g. Student Council 2026"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        Start Date & Time (UTC)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-rose-500 outline-none"
                        />
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startTime: e.target.value,
                            })
                          }
                          className="w-32 bg-slate-950/50 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-rose-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                        End Date & Time (UTC)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                          className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-rose-500 outline-none"
                        />
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endTime: e.target.value,
                            })
                          }
                          className="w-32 bg-slate-950/50 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-rose-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:border-rose-500 outline-none transition-colors"
                      placeholder="Brief details..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                </div>

                {/* Candidates */}
                <div className="border-t border-slate-700/50 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FiUsers className="text-emerald-400" /> Candidates
                    </h3>
                    <button
                      onClick={addCandidateSlot}
                      type="button"
                      className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 font-bold flex items-center gap-1"
                    >
                      <FiPlus /> Add Slot
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.candidates.map((candidate, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center bg-slate-800/30 p-2 rounded-xl border border-slate-700/50"
                      >
                        <span className="text-slate-500 font-mono text-xs w-6 text-center">
                          {index + 1}
                        </span>
                        {/* Name Input */}
                        <input
                          type="text"
                          placeholder="Candidate Name"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:border-rose-500 outline-none"
                          value={candidate.name}
                          onChange={(e) =>
                            handleCandidateChange(index, "name", e.target.value)
                          }
                        />
                        {/* Designation Input (Replaces Party) */}
                        <input
                          type="text"
                          placeholder="Designation / Info"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:border-rose-500 outline-none"
                          value={candidate.designation}
                          onChange={(e) =>
                            handleCandidateChange(
                              index,
                              "designation",
                              e.target.value,
                            )
                          }
                        />
                        <button
                          onClick={() => removeCandidateSlot(index)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <FiMinusCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSaving ? (
                    <>
                      <FiLoader className="animate-spin inline mr-2" />{" "}
                      Saving...
                    </>
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Publish Election"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageElections;
