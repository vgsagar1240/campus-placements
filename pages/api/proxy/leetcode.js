export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.body;

  try {
    // Use the reliable LeetCode stats API
    const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch LeetCode data');
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error('User not found');
    }

    const score = (data.easySolved * 10 + data.mediumSolved * 20 + data.hardSolved * 30);
    
    res.status(200).json({
      problemsSolved: data.totalSolved,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      rating: data.contestRating || Math.floor(score / 10),
      rank: data.ranking || 0,
      contestRating: data.contestRating || 0,
      score,
      streak: 0,
      achievements: [],
      acceptanceRate: data.acceptanceRate || 0,
      totalProblems: data.totalQuestions || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
