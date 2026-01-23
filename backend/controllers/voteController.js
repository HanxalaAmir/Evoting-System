const supabase = require('../config/supabaseClient');
const crypto = require('crypto'); // Built-in Node module for hashing

// --- 1. CAST VOTE ---
const castVote = async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user.id;

  try {
    // A. Check if user already voted (Double Vote Prevention)
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('election_id', electionId)
      .maybeSingle();

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election.' });
    }

    // B. Create a "Blockchain" Hash (Simulated Security)
    const voteData = `${userId}-${electionId}-${candidateId}-${Date.now()}`;
    const voteHash = crypto.createHash('sha256').update(voteData).digest('hex');

    // C. Insert Vote
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert([{ 
        user_id: userId, 
        election_id: electionId, 
        candidate_id: candidateId,
        vote_hash: voteHash
      }])
      .select()
      .single();

    if (voteError) throw voteError;

    // D. Increment Candidate Vote Count
    // (We fetch current count first, then update. In high-scale apps, use RPC)
    const { data: candidate } = await supabase
      .from('candidates')
      .select('votes')
      .eq('id', candidateId)
      .single();

    await supabase
      .from('candidates')
      .update({ votes: (candidate.votes || 0) + 1 })
      .eq('id', candidateId);

    res.status(201).json({ message: 'Vote cast successfully', voteHash });

  } catch (error) {
    console.error("Voting Error:", error);
    // Handle unique constraint violation just in case race condition occurs
    if (error.code === '23505') { 
      return res.status(400).json({ message: 'You have already voted.' });
    }
    res.status(500).json({ message: 'Voting failed', error: error.message });
  }
};

// --- 2. GET VOTER HISTORY ---
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch votes with joined Election and Candidate data
    const { data, error } = await supabase
      .from('votes')
      .select(`
        *,
        elections (title, status, end_time),
        candidates (name, party)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data for Frontend UI
    const formattedHistory = data.map(vote => ({
      id: vote.id,
      electionTitle: vote.elections?.title,
      electionStatus: vote.elections?.status,
      date: vote.created_at,
      candidateName: vote.candidates?.name,
      party: vote.candidates?.party,
      voteHash: vote.vote_hash,
      // Simple logic: If election ended, we could show winner (future feature)
      result: vote.elections?.status === 'Ended' ? 'Completed' : 'Active' 
    }));

    res.json(formattedHistory);

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// --- 3. CHECK ELIGIBILITY (Helper) ---
const checkEligibility = async (req, res) => {
  const { electionId } = req.params;
  const userId = req.user.id;

  try {
    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('election_id', electionId)
      .maybeSingle();

    res.json({ canVote: !data }); // If data exists, canVote = false
  } catch (error) {
    res.status(500).json({ message: 'Check failed' });
  }
};

module.exports = { castVote, getHistory, checkEligibility };