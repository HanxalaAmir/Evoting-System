const supabase = require('../config/supabaseClient');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const castVote = asyncHandler(async (req, res, next) => {
  const { electionId, candidateId, indexNumber } = req.body;
  const userId = req.user.id;

  if (!electionId || !candidateId || !indexNumber) {
    throw new AppError('Missing required fields', 400);
  }

  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new AppError('Election not found', 404);
  }

  if (election.status !== 'Active') {
    throw new AppError('Election is closed', 400);
  }

  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', electionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingVote) {
    throw new AppError('You have already voted in this election', 409);
  }

  const { error: voteError } = await supabase.from('votes').insert([{
    user_id: userId,
    election_id: electionId,
    candidate_id: candidateId,
    index_number: indexNumber,
    timestamp: new Date().toISOString()
  }]);

  if (voteError) throw new AppError(voteError.message, 500);

  const { data: candidate } = await supabase
    .from('candidates')
    .select('vote_count')
    .eq('id', candidateId)
    .single();

  if (candidate) {
    await supabase
      .from('candidates')
      .update({ vote_count: (candidate.vote_count || 0) + 1 })
      .eq('id', candidateId);
  }

  res.status(201).json({ message: 'Vote cast successfully' });
});

const getHistory = asyncHandler(async (req, res, next) => {
  const { data: votes, error } = await supabase
    .from('votes')
    .select(`
      id, 
      date: timestamp, 
      index_number,
      election: elections ( id, title, status, end_time ),
      candidate: candidates ( name )
    `)
    .eq('user_id', req.user.id)
    .order('timestamp', { ascending: false });

  if (error) throw new AppError('Failed to retrieve history', 500);

  const formatted = votes.map(v => ({
    id: v.id,
    electionId: v.election?.id,
    electionTitle: v.election?.title,
    status: v.election?.status,
    myCandidate: v.candidate?.name,
    date: v.date,
    voteHash: v.id
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