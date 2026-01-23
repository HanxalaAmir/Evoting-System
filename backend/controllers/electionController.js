const supabase = require('../config/supabaseClient');

// Helper to determine status based on time
const determineStatus = (start, end) => {
    const now = new Date();
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (now >= endTime) return 'Ended';
    if (now >= startTime) return 'Active';
    return 'Upcoming';
};

// --- 1. GET ALL ELECTIONS ---
const getElections = async (req, res) => {
    try {
        // First, let's auto-update statuses based on current time
        // (In a huge production app, this would be a Cron Job, but this works fine here)
        const { data: allElections } = await supabase.from('elections').select('id, start_time, end_time, status');

        if (allElections) {
            for (const election of allElections) {
                const newStatus = determineStatus(election.start_time, election.end_time);
                if (newStatus !== election.status) {
                    await supabase.from('elections').update({ status: newStatus }).eq('id', election.id);
                }
            }
        }

        // Now fetch the fresh data
        const { data, error } = await supabase
            .from('elections')
            .select(`*, candidates (*)`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch elections', error: error.message });
    }
};

// --- 2. GET SINGLE ---
const getElectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('elections').select(`*, candidates (*)`).eq('id', id).single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(404).json({ message: 'Election not found' });
    }
};

// --- 3. CREATE ELECTION ---
const createElection = async (req, res) => {
    const { title, description, startTime, endTime, candidates } = req.body;

    try {
        // 1. Calculate Initial Status
        const initialStatus = determineStatus(startTime, endTime);

        // 2. Insert Election
        const { data: election, error: electionError } = await supabase
            .from('elections')
            .insert([{
                title,
                description,
                start_time: startTime,
                end_time: endTime,
                status: initialStatus
            }])
            .select()
            .single();

        if (electionError) throw electionError;

        // 3. Insert Candidates
        if (candidates && candidates.length > 0) {
            const candidatesData = candidates.map(c => ({
                election_id: election.id,
                name: c.name,
                party: c.party,
                designation: c.designation || 'Candidate',
            }));

            const { error: candidateError } = await supabase.from('candidates').insert(candidatesData);
            if (candidateError) throw candidateError;
        }

        res.status(201).json({ message: 'Election created', election });

    } catch (error) {
        res.status(500).json({ message: 'Failed to create election', error: error.message });
    }
};

// --- 4. UPDATE ELECTION (FIXED) ---
const updateElection = async (req, res) => {
    try {
        const { id } = req.params;
        const { candidates, ...electionUpdates } = req.body; // Separate candidates from election data

        // 1. Recalculate Status if dates changed
        if (electionUpdates.startTime || electionUpdates.endTime) {
            // Fetch current times if not provided in update
            // (For simplicity, we assume frontend sends both dates on edit)
            const status = determineStatus(electionUpdates.startTime, electionUpdates.endTime);
            electionUpdates.status = status;

            // Map frontend camelCase to DB snake_case
            electionUpdates.start_time = electionUpdates.startTime;
            electionUpdates.end_time = electionUpdates.endTime;
            delete electionUpdates.startTime;
            delete electionUpdates.endTime;
        }

        // 2. Update Election Table
        const { error: updateError } = await supabase
            .from('elections')
            .update(electionUpdates)
            .eq('id', id);

        if (updateError) throw updateError;

        // 3. Update Candidates (Upsert Strategy)
        if (candidates && candidates.length > 0) {
            for (const c of candidates) {
                if (c.id) {
                    // Update existing candidate
                    await supabase
                        .from('candidates')
                        .update({ name: c.name, party: c.party, designation: c.designation })
                        .eq('id', c.id);
                } else {
                    // Insert new candidate added during edit
                    await supabase
                        .from('candidates')
                        .insert({
                            election_id: id,
                            name: c.name,
                            party: c.party,
                            designation: c.designation
                        });
                }
            }
        }

        res.json({ message: 'Election updated successfully' });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: 'Update failed', error: error.message });
    }
}

// --- 5. DELETE ---
const deleteElection = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('elections').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: 'Election deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Delete failed' });
    }
};

module.exports = { getElections, getElectionById, createElection, deleteElection, updateElection };