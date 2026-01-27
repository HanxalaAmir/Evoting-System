const supabase = require('../config/supabaseClient');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// Helper to check status based on time
const determineStatus = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now >= endTime) return 'Ended';
    if (now >= startTime && now < endTime) return 'Active';
    return 'Upcoming';
};

const getAllElections = asyncHandler(async (req, res, next) => {
    // We select candidates(*) which automatically includes the 'votes' column
    const { data: allElections, error } = await supabase
        .from('elections')
        .select(`*, candidates (*)`)
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    // Auto-update status if time has passed
    const processedData = allElections.map(e => {
        const correctStatus = determineStatus(e.start_time, e.end_time);
        if (e.status !== correctStatus) {
            supabase.from('elections').update({ status: correctStatus }).eq('id', e.id).then();
            return { ...e, status: correctStatus };
        }
        return e;
    });

    res.status(200).json(processedData);
});

const getActiveElections = asyncHandler(async (req, res, next) => {
    const { data, error } = await supabase
        .from('elections')
        .select(`*, candidates (*)`)
        .eq('status', 'Active')
        .order('end_time', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    res.status(200).json(data);
});

const getElectionById = asyncHandler(async (req, res, next) => {
    const { data, error } = await supabase
        .from('elections')
        .select(`*, candidates (*)`)
        .eq('id', req.params.id)
        .single();

    if (error || !data) throw new AppError('Election not found', 404);

    res.status(200).json(data);
});

const createElection = asyncHandler(async (req, res, next) => {
    const { title, description, startTime, endTime, candidates } = req.body;

    if (!title || !startTime || !endTime || !candidates || candidates.length < 2) {
        throw new AppError('Invalid input. Title, dates, and at least 2 candidates are required.', 400);
    }

    // 1. Create Election
    const { data: election, error: err1 } = await supabase
        .from('elections')
        .insert([{
            title,
            description,
            start_time: startTime,
            end_time: endTime,
            status: determineStatus(startTime, endTime)
        }])
        .select()
        .single();

    if (err1) throw new AppError(err1.message, 500);

    // 2. Prepare Candidates (Removed 'party', kept 'color' & 'designation')
    const candidatesData = candidates.map(c => ({
        election_id: election.id,
        name: c.name,
        designation: c.designation || 'Independent',
        color: c.color // Critical for UI gradients
    }));

    // 3. Insert Candidates
    const { error: err2 } = await supabase.from('candidates').insert(candidatesData);
    if (err2) throw new AppError(err2.message, 500);

    res.status(201).json({ message: 'Election created successfully', election });
});

const updateElection = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { candidates, ...updates } = req.body;
    const dbUpdates = {};

    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    if (updates.startTime && updates.endTime) {
        dbUpdates.start_time = updates.startTime;
        dbUpdates.end_time = updates.endTime;
        dbUpdates.status = determineStatus(updates.startTime, updates.endTime);
    }

    if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase.from('elections').update(dbUpdates).eq('id', id);
        if (error) throw new AppError(error.message, 500);
    }

    // Handle Candidates Update
    if (candidates && Array.isArray(candidates)) {
        const { data: existing } = await supabase.from('candidates').select('id').eq('election_id', id);
        const existingIds = existing.map(c => c.id);
        const incomingIds = candidates.filter(c => c.id).map(c => c.id);

        // Delete removed candidates
        const toDelete = existingIds.filter(x => !incomingIds.includes(x));
        if (toDelete.length > 0) {
            await supabase.from('candidates').delete().in('id', toDelete);
        }

        // Upsert (Update or Insert)
        for (const c of candidates) {
            if (c.id) {
                await supabase.from('candidates')
                    .update({
                        name: c.name,
                        designation: c.designation,
                        color: c.color
                    })
                    .eq('id', c.id);
            } else {
                await supabase.from('candidates')
                    .insert({
                        election_id: id,
                        name: c.name,
                        designation: c.designation,
                        color: c.color
                    });
            }
        }
    }

    res.status(200).json({ message: 'Election updated successfully' });
});

const deleteElection = asyncHandler(async (req, res, next) => {
    const { error } = await supabase.from('elections').delete().eq('id', req.params.id);
    if (error) throw new AppError('Failed to delete election', 500);
    res.status(200).json({ message: 'Election deleted successfully' });
});

const getElectionStats = asyncHandler(async (req, res, next) => {
    // Quick stats for admin dashboard
    const { count: total } = await supabase.from('elections').select('*', { count: 'exact', head: true });
    const { count: active } = await supabase.from('elections').select('*', { count: 'exact', head: true }).eq('status', 'Active');
    const { count: votes } = await supabase.from('votes').select('*', { count: 'exact', head: true });
    const { count: voters } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'voter');

    res.status(200).json({
        totalElections: total || 0,
        activeElections: active || 0,
        totalVotes: votes || 0,
        totalVoters: voters || 0
    });
});

const getElectionResults = asyncHandler(async (req, res, next) => {
    // FIXED: Select 'votes' (your DB column name) instead of 'vote_count'
    // Removed 'party' from selection
    const { data: candidates, error } = await supabase
        .from('candidates')
        .select('id, name, designation, votes, color')
        .eq('election_id', req.params.id)
        .order('votes', { ascending: false });

    if (error) throw new AppError('Failed to fetch results', 500);

    const total = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);

    const results = candidates.map(c => ({
        id: c.id,
        name: c.name,
        designation: c.designation,
        color: c.color,
        votes: c.votes || 0,
        percentage: total === 0 ? 0 : ((c.votes / total) * 100).toFixed(1)
    }));

    res.status(200).json(results);
});

module.exports = {
    getAllElections,
    getActiveElections,
    getElectionById,
    createElection,
    updateElection,
    deleteElection,
    getElectionStats,
    getElectionResults
};