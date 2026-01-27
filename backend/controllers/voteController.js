const supabase = require('../config/supabaseClient');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const crypto = require('crypto'); // Added for secure hashing

const castVote = asyncHandler(async (req, res, next) => {
  const { electionId, candidateId, indexNumber } = req.body;
  const userId = req.user.id;

  if (!electionId || !candidateId || !indexNumber) {
    throw new AppError('Missing required fields', 400);
  }

  // 1. Check Election Status
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status, title')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new AppError('Election not found', 404);
  }

  if (election.status !== 'Active') {
    throw new AppError('Election is closed', 400);
  }

  // 2. Check Duplicate Vote
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', electionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingVote) {
    throw new AppError('You have already voted in this election', 409);
  }

  // 3. Generate Secure Hash (Fixes the NULL issue)
  const rawData = `${electionId}-${userId}-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
  const voteHash = crypto.createHash('sha256').update(rawData).digest('hex');

  // 4. Insert Vote
  // We removed 'timestamp' (using created_at) and added 'vote_hash'
  const { error: voteError } = await supabase.from('votes').insert([{
    user_id: userId,
    election_id: electionId,
    candidate_id: candidateId,
    index_number: indexNumber,
    vote_hash: voteHash
  }]);

  if (voteError) throw new AppError(voteError.message, 500);

  // NOTE: Manual update of 'candidates' table removed. 
  // Your SQL Trigger 'on_vote_cast' now handles the count automatically!

  res.status(201).json({
    message: 'Vote cast successfully',
    voteHash,
    electionTitle: election.title
  });
});

const getHistory = asyncHandler(async (req, res, next) => {
  // Updated Query: Fetches real vote counts and hash
  const { data: votes, error } = await supabase
    .from('votes')
    .select(`
      id, 
      created_at, 
      vote_hash,
      index_number,
      elections ( id, title, status, end_time ),
      candidates ( name, votes )
    `)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) throw new AppError('Failed to retrieve history', 500);

  const formatted = votes.map(v => ({
    id: v.id,
    electionId: v.elections?.id,
    electionTitle: v.elections?.title,
    status: v.elections?.status,
    myCandidate: v.candidates?.name,
    myCandidateVotes: v.candidates?.votes, // Real data from Trigger
    date: v.created_at,
    voteHash: v.vote_hash,
    // Placeholders for complex "Winner" logic (usually requires separate aggregation)
    winnerName: "TBD",
    winnerVotes: 0
  }));

  res.status(200).json(formatted);
});

const checkEligibility = asyncHandler(async (req, res, next) => {
  const { data } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', req.params.electionId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (data) {
    return res.status(409).json({ canVote: false, message: "Already voted" });
  }

  res.status(200).json({ canVote: true });
});

const checkRegistration = asyncHandler(async (req, res, next) => {
  const { indexNumber } = req.params;

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('username', indexNumber)
    .maybeSingle();

  if (user) {
    res.status(200).json({ eligible: true, message: `Verified: Registered as ${user.full_name}` });
  } else {
    res.status(200).json({ eligible: false, message: "Index Number not found" });
  }
});

module.exports = { castVote, getHistory, checkEligibility, checkRegistration };