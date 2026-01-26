import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { electionAPI } from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiSearch,
  FiDownload,
  FiCalendar,
  FiCheckCircle,
  FiUser,
  FiX,
  FiBox,
  FiClock,
  FiFileText,
  FiEye,
  FiAward,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

const ElectionResults = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isExporting, setIsExporting] = useState(false);
  const [isSingleExporting, setIsSingleExporting] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await electionAPI.getAll();

      // FIX: Only show 'Completed' or 'Ended' elections.
      // Active elections are hidden until finalized.
      const archived = response.data.filter(
        (e) => e.status === "Completed" || e.status === "Ended",
      );
      setResults(archived);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load election archive. Please check your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const calculateTotalVotes = (candidates) => {
    return (candidates || []).reduce(
      (sum, c) => sum + (Number(c.vote_count) || Number(c.votes) || 0),
      0,
    );
  };

  const getWinner = (candidates) => {
    if (!candidates || candidates.length === 0)
      return { name: "N/A", designation: "-", color: "bg-slate-700" };

    // Sort by votes descending
    const sorted = [...candidates].sort(
      (a, b) => (Number(b.vote_count) || 0) - (Number(a.vote_count) || 0),
    );

    // If no votes at all, no winner yet
    const total = calculateTotalVotes(candidates);
    if (total === 0)
      return { name: "No Votes", designation: "-", color: "bg-slate-700" };

    return sorted[0];
  };

  const filteredResults = results.filter((r) => {
    const matchesSearch = r.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFrom = dateFrom
      ? new Date(r.start_time) >= new Date(dateFrom)
      : true;
    const matchesTo = dateTo
      ? new Date(r.start_time) <= new Date(dateTo)
      : true;
    return matchesSearch && matchesFrom && matchesTo;
  });

  // --- PDF GENERATION ---
  const generateSinglePDF = (election) => {
    const doc = new jsPDF();
    const totalVotes = calculateTotalVotes(election.candidates);
    const winner = getWinner(election.candidates);

    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Official Election Result", 14, 25);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`Election ID: ${election.id}`, 14, 55);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(election.title, 14, 65);
    doc.setFontSize(11);
    doc.text(`Description: ${election.description || "N/A"}`, 14, 72);

    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 80, 180, 25, 3, 3, "FD");
    doc.setFontSize(12);
    doc.text(`Winner: ${winner.name}`, 20, 95);
    doc.text(`Total Votes: ${totalVotes}`, 120, 95);

    const tableColumn = [
      "Rank",
      "Candidate Name",
      "Designation",
      "Party",
      "Votes",
      "Share (%)",
    ];
    const tableRows = [];

    const sortedCandidates = [...(election.candidates || [])].sort(
      (a, b) =>
        (Number(b.vote_count) || Number(b.votes) || 0) -
        (Number(a.vote_count) || Number(a.votes) || 0),
    );

    sortedCandidates.forEach((candidate, index) => {
      const votes =
        Number(candidate.vote_count) || Number(candidate.votes) || 0;
      const percent =
        totalVotes === 0
          ? "0.0%"
          : `${((votes / totalVotes) * 100).toFixed(1)}%`;

      tableRows.push([
        index + 1,
        candidate.name,
        candidate.designation,
        candidate.party,
        votes,
        percent,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 115,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      "System generated report. Validated by Blockchain Ledger.",
      14,
      pageHeight - 10,
    );

    doc.save(`Election_Report_${election.id}.pdf`);
  };

  const generateBulkPDF = () => {
    const doc = new jsPDF();

    doc.setFillColor(46, 204, 113);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Election Archive Summary", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`Total Records: ${filteredResults.length}`, 14, 45);

    const tableColumn = [
      "ID",
      "Election Title",
      "Date",
      "Winner",
      "Total Votes",
      "Status",
    ];
    const tableRows = [];

    filteredResults.forEach((election) => {
      const winner = getWinner(election.candidates);
      const total = calculateTotalVotes(election.candidates);

      tableRows.push([
        election.id.substring(0, 8),
        election.title,
        new Date(election.start_time).toLocaleDateString(),
        winner.name,
        total,
        election.status,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: "grid",
      headStyles: { fillColor: [46, 204, 113] },
      styles: { fontSize: 9 },
    });

    doc.save(`Bulk_Election_Report.pdf`);
  };

  const handleSingleExport = () => {
    if (!selectedElection) return;
    setIsSingleExporting(true);
    try {
      generateSinglePDF(selectedElection);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    } finally {
      setIsSingleExporting(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      generateBulkPDF();
    } catch (err) {
      console.error(err);
      alert("Error generating Bulk PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 border-b border-slate-800 pb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-600/20">
                <FiFileText className="text-white w-6 h-6" />
              </div>
              Election Results Archive
              {!isLoading && (
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20 ml-2">
                  {filteredResults.length} Records
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-3 ml-1 max-w-xl">
              Official records of all finalized elections. Data sourced directly
              from the secure ledger.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting || isLoading || results.length === 0}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm w-full lg:w-auto"
          >
            {isExporting ? (
              <>
                <FiLoader className="animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <FiDownload className="w-4 h-4" /> Download Bulk Report (PDF)
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl mb-6 animate-slide-up flex flex-col md:flex-row gap-4 items-center shadow-lg">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-4 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search Election Title..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-auto">
            <div className="absolute left-4 top-3.5 text-slate-500 pointer-events-none">
              <FiCalendar />
            </div>
            <input
              type="date"
              className="w-full md:w-44 bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <span className="text-slate-500 hidden md:block">to</span>
          <div className="relative w-full md:w-auto">
            <div className="absolute left-4 top-3.5 text-slate-500 pointer-events-none">
              <FiCalendar />
            </div>
            <input
              type="date"
              className="w-full md:w-44 bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-300 focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          {(searchTerm || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="text-slate-400 hover:text-white p-3 hover:bg-slate-700 rounded-xl transition-colors"
              title="Clear Filters"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Content Table */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl animate-slide-up backdrop-blur-sm min-h-[300px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
              <FiLoader className="w-10 h-10 text-rose-500 animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Retrieving archives...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-red-500/10 p-4 rounded-full mb-4">
                <FiAlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Connection Error
              </h3>
              <p className="text-slate-400 mb-6 max-w-md">{error}</p>
              <button
                onClick={fetchResults}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm font-bold"
              >
                <FiRefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 border-dashed">
                <FiSearch className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium">
                No finalized elections found matching your filters.
              </p>
              {(searchTerm || dateFrom) && (
                <button
                  onClick={clearFilters}
                  className="text-rose-400 text-sm font-bold mt-2 hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-700/50">
                    <th className="p-5 pl-6">Election Title / ID</th>
                    <th className="p-5">Schedule</th>
                    <th className="p-5">Winner</th>
                    <th className="p-5">Total Votes</th>
                    <th className="p-5 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-sm">
                  {filteredResults.map((result) => {
                    const winner = getWinner(result.candidates);
                    const totalVotes = calculateTotalVotes(result.candidates);
                    return (
                      <tr
                        key={result.id}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="p-5 pl-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-base mb-1">
                              {result.title}
                            </span>
                            <span className="text-xs font-mono text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50 w-fit">
                              {result.id}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-slate-400">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="flex items-center gap-2">
                              <FiCalendar className="text-rose-400" />{" "}
                              {new Date(result.start_time).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <FiClock className="text-rose-400" />{" "}
                              {new Date(result.end_time).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${winner.color || "bg-slate-600"} text-xs`}
                            >
                              {winner.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {winner.name}
                              </p>
                              <p className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block">
                                {winner.designation}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-white font-mono">
                            <FiBox className="text-blue-400" /> {totalVotes}
                          </div>
                        </td>
                        <td className="p-5 pr-6 text-right">
                          <button
                            onClick={() => setSelectedElection(result)}
                            className="text-xs font-semibold bg-slate-700/50 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-600 hover:border-indigo-500 px-4 py-2 rounded-lg transition-all flex items-center gap-2 ml-auto shadow-sm hover:shadow-indigo-500/20"
                          >
                            <FiEye /> View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="p-3 border-t border-slate-700/50 bg-slate-900/30 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
              <FiCheckCircle className="w-3 h-3 text-emerald-500" /> Official
              System Record Synced
            </p>
          </div>
        </div>

        {/* Selected Election Modal */}
        {selectedElection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl animate-slide-up relative flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800/50 rounded-t-2xl">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedElection.title}
                    </h2>
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wide">
                      Finalized
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <span className="font-mono text-slate-500">
                      {selectedElection.id}
                    </span>{" "}
                    •{" "}
                    {new Date(selectedElection.start_time).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedElection(null)}
                  className="bg-slate-800 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 text-sm text-slate-300 leading-relaxed">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <FiFileText /> Election Description
                  </h4>
                  {selectedElection.description || "No description provided."}
                  <div className="mt-4 flex gap-6 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-rose-400" />{" "}
                      <span className="text-white">
                        {new Date(
                          selectedElection.start_time,
                        ).toLocaleTimeString()}{" "}
                        -{" "}
                        {new Date(
                          selectedElection.end_time,
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <FiUser className="text-indigo-400" /> Final Vote Breakdown
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-slate-700">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-800 text-slate-400 text-xs uppercase font-bold">
                        <tr>
                          <th className="p-4">Rank</th>
                          <th className="p-4">Candidate Name</th>
                          <th className="p-4">Designation</th>
                          <th className="p-4 text-right">Votes</th>
                          <th className="p-4 text-right">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 bg-slate-800/20">
                        {(selectedElection.candidates || [])
                          .sort(
                            (a, b) =>
                              (Number(b.vote_count) || Number(b.votes) || 0) -
                              (Number(a.vote_count) || Number(a.votes) || 0),
                          )
                          .map((candidate, index) => {
                            // FIX: Ensure accurate total and 0 if no votes
                            const total = calculateTotalVotes(
                              selectedElection.candidates,
                            );
                            const votes =
                              Number(candidate.vote_count) ||
                              Number(candidate.votes) ||
                              0;
                            const percent =
                              total === 0
                                ? 0
                                : ((votes / total) * 100).toFixed(1);
                            const isWinner = index === 0;
                            return (
                              <tr
                                key={index}
                                className={isWinner ? "bg-emerald-500/5" : ""}
                              >
                                <td className="p-4">
                                  {isWinner ? (
                                    <FiAward className="text-amber-400 w-5 h-5" />
                                  ) : (
                                    <span className="text-slate-500 font-mono ml-1">
                                      #{index + 1}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 font-semibold text-white">
                                  {candidate.name}
                                </td>
                                <td className="p-4 text-slate-400">
                                  {candidate.designation}
                                </td>
                                <td className="p-4 text-right font-mono text-white">
                                  {votes}
                                </td>
                                <td className="p-4 text-right">
                                  <span
                                    className={`text-xs font-bold px-2 py-1 rounded ${isWinner ? "bg-emerald-500/10 text-emerald-400" : "text-slate-500"}`}
                                  >
                                    {percent}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 bg-slate-800/50 rounded-b-2xl flex justify-end gap-3 backdrop-blur-sm">
                <button
                  onClick={() => setSelectedElection(null)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors text-sm font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={handleSingleExport}
                  disabled={isSingleExporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait text-sm font-bold"
                >
                  {isSingleExporting ? (
                    <>
                      <FiLoader className="animate-spin" /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <FiDownload className="w-4 h-4" /> Download Official
                      Results (PDF)
                    </>
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

export default ElectionResults;
