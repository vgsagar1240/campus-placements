import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { db } from '../firebase/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

interface CodingLeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  codingScore: number;
  codingProfiles: {
    platform: string;
    username: string;
    problemsSolved: number;
    rating: number;
    score: number;
    rank?: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
    contestRating?: number;
    stars?: number;
    contestsParticipated?: number;
  }[];
  totalProblems: number;
  averageRating: number;
}

export default function CodingLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<CodingLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Get all users with coding profiles
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const entries: CodingLeaderboardEntry[] = [];
      
      console.log('Total users found:', usersSnapshot.size);
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        
        // Check if user has any coding profiles (stored as individual platform profiles)
        const codingProfiles = [];
        let totalProblems = 0;
        let totalRating = 0;
        let profileCount = 0;
        
        // Check for individual platform profiles
        if (userData.codingProfiles) {
          console.log('User has coding profiles:', userData.name, userData.codingProfiles);
          Object.keys(userData.codingProfiles).forEach(platform => {
            const profile = userData.codingProfiles[platform];
            if (profile && profile.username) {
              console.log('Processing platform:', platform, profile);
              codingProfiles.push({
                platform: platform,
                username: profile.username,
                problemsSolved: profile.problemsSolved || 0,
                rating: profile.rating || 0,
                score: profile.score || 0,
                rank: profile.rank || 0,
                easySolved: profile.easySolved || 0,
                mediumSolved: profile.mediumSolved || 0,
                hardSolved: profile.hardSolved || 0,
                contestRating: profile.contestRating || 0,
                stars: profile.stars || 0,
                contestsParticipated: profile.contestsParticipated || 0
              });
              totalProblems += profile.problemsSolved || 0;
              totalRating += profile.rating || 0;
              profileCount++;
            }
          });
        } else {
          console.log('User has no coding profiles:', userData.name);
        }
        
        // Only include users who have at least one coding profile
        if (codingProfiles.length > 0) {
          const averageRating = profileCount > 0 ? totalRating / profileCount : 0;
          
          // Calculate platform-specific scores based on actual platform metrics
          let codingScore = 0;
          const leetcodeProfile = codingProfiles.find(p => p.platform === 'leetcode');
          const hackerrankProfile = codingProfiles.find(p => p.platform === 'hackerrank');
          const codechefProfile = codingProfiles.find(p => p.platform === 'codechef');
          
          let platformScores = [];
          
          if (leetcodeProfile) {
            // LeetCode scoring: Based on problems solved, difficulty distribution, and contest rating
            const totalSolved = leetcodeProfile.problemsSolved || 0;
            const easySolved = leetcodeProfile.easySolved || 0;
            const mediumSolved = leetcodeProfile.mediumSolved || 0;
            const hardSolved = leetcodeProfile.hardSolved || 0;
            const contestRating = leetcodeProfile.contestRating || 0;
            
            // Weighted scoring similar to LeetCode's system
            const difficultyScore = (easySolved * 1) + (mediumSolved * 3) + (hardSolved * 5);
            const contestScore = Math.min(contestRating / 20, 100); // Normalize contest rating
            const problemScore = Math.min((totalSolved / 50) * 100, 100); // Normalize problem count
            
            const leetcodeScore = (difficultyScore * 0.4) + (contestScore * 0.4) + (problemScore * 0.2);
            platformScores.push(leetcodeScore);
          }
          
          if (hackerrankProfile) {
            // HackerRank scoring: Based on points, problems solved, and skill rating
            const points = hackerrankProfile.score || 0;
            const problemsSolved = hackerrankProfile.problemsSolved || 0;
            const skillRating = hackerrankProfile.rating || 0;
            
            const pointsScore = Math.min((points / 25), 100); // Normalize points
            const problemsScore = Math.min((problemsSolved / 3), 100); // Normalize problems
            const skillScore = Math.min((skillRating / 16), 100); // Normalize skill rating
            
            const hackerrankScore = (pointsScore * 0.5) + (problemsScore * 0.3) + (skillScore * 0.2);
            platformScores.push(hackerrankScore);
          }
          
          if (codechefProfile) {
            // CodeChef scoring: Based on rating, problems solved, stars, and contests
            const rating = codechefProfile.rating || 0;
            const problemsSolved = codechefProfile.problemsSolved || 0;
            const stars = codechefProfile.stars || 0;
            const contests = codechefProfile.contestsParticipated || 0;
            
            const ratingScore = Math.min((rating / 30), 100); // Normalize rating
            const problemsScore = Math.min((problemsSolved / 5), 100); // Normalize problems
            const starsScore = (stars / 5) * 100; // Stars out of 5
            const contestsScore = Math.min((contests / 6), 100); // Normalize contests
            
            const codechefScore = (ratingScore * 0.4) + (problemsScore * 0.3) + (starsScore * 0.2) + (contestsScore * 0.1);
            platformScores.push(codechefScore);
          }
          
          // Calculate overall score as average of platform scores
          if (platformScores.length > 0) {
            codingScore = platformScores.reduce((sum, score) => sum + score, 0) / platformScores.length;
          } else {
            // Fallback to original calculation
            codingScore = userData.codingScore || (totalProblems * 0.4 + averageRating * 0.6);
          }

          entries.push({
            userId: doc.id,
            name: userData.name || userData.displayName || 'Unknown User',
            email: userData.email || '',
            codingScore: codingScore,
            codingProfiles: codingProfiles,
            totalProblems,
            averageRating: averageRating
          });
        }
      });

      // Sort by coding score (descending)
      entries.sort((a, b) => b.codingScore - a.codingScore);
      
      console.log('Final leaderboard entries:', entries);
      setLeaderboard(entries.slice(0, 20)); // Top 20
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ffd700'; // Gold
    if (rank === 2) return '#c0c0c0'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#666';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <TrophyIcon />;
    return <Typography variant="h6" sx={{ fontWeight: 700 }}>{rank}</Typography>;
  };

  const getPlatformChips = (profiles: any[]) => {
    return profiles.map((profile, index) => (
      <Chip
        key={index}
        label={profile.platform.toUpperCase()}
        size="small"
        sx={{
          fontSize: '0.7rem',
          height: 20,
          backgroundColor: getPlatformColor(profile.platform),
          color: 'white',
          fontWeight: 600
        }}
      />
    ));
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'leetcode': return '#ffa116';
      case 'hackerrank': return '#2ec866';
      case 'codechef': return '#7b2cbf';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading leaderboard...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No coding profiles found. Students need to sync their coding profiles to appear on the leaderboard.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <TrophyIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Coding Leaderboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Top performers across coding platforms
            </Typography>
          </Box>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Platform Scores" />
          <Tab label="Problems Solved" />
          <Tab label="Average Rating" />
          <Tab label="Overall" />
        </Tabs>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                {activeTab === 0 ? (
                  <>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>LeetCode</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>HackerRank</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>CodeChef</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Overall</TableCell>
                  </>
                ) : (
                  <>
                <TableCell sx={{ fontWeight: 700 }}>Platforms</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  {activeTab === 1 && 'Problems Solved'}
                  {activeTab === 2 && 'Avg Rating'}
                  {activeTab === 3 && 'Overall Score'}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Progress</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                
                if (activeTab === 0) {
                  // Platform Scores tab - show individual platform scores
                  const leetcodeProfile = entry.codingProfiles.find(p => p.platform === 'leetcode');
                  const hackerrankProfile = entry.codingProfiles.find(p => p.platform === 'hackerrank');
                  const codechefProfile = entry.codingProfiles.find(p => p.platform === 'codechef');

                  return (
                    <TableRow key={entry.userId} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ color: getRankColor(rank) }}>
                            {getRankIcon(rank)}
                          </Box>
                          {rank > 3 && (
                            <Typography variant="body2" color="text.secondary">
                              #{rank}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {entry.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {entry.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {entry.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        {leetcodeProfile ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffa116' }}>
                              {leetcodeProfile.problemsSolved || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Easy: {leetcodeProfile.easySolved || 0} | Med: {leetcodeProfile.mediumSolved || 0} | Hard: {leetcodeProfile.hardSolved || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Rank: {leetcodeProfile.rank && leetcodeProfile.rank > 0 ? leetcodeProfile.rank.toLocaleString() : 'N/A'}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {hackerrankProfile ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2ec866' }}>
                              {hackerrankProfile.score || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Problems: {hackerrankProfile.problemsSolved || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Skill Rating: {hackerrankProfile.rating || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Rank: {hackerrankProfile.rank && hackerrankProfile.rank > 0 ? hackerrankProfile.rank.toLocaleString() : 'N/A'}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {codechefProfile ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#7b2cbf' }}>
                              {codechefProfile.rating || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Problems: {codechefProfile.problemsSolved || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Stars: {'★'.repeat(codechefProfile.stars || 0)} | Contests: {codechefProfile.contestsParticipated || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Rank: {codechefProfile.rank && codechefProfile.rank > 0 ? codechefProfile.rank.toLocaleString() : 'N/A'}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {entry.codingScore.toFixed(0)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Weighted Score
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                } else {
                  // Other tabs - original layout
                const displayValue = activeTab === 1 ? entry.totalProblems : 
                                   activeTab === 2 ? entry.averageRating : 
                                   entry.codingScore;
                const maxValue = activeTab === 1 ? Math.max(...leaderboard.map(e => e.totalProblems)) :
                               activeTab === 2 ? Math.max(...leaderboard.map(e => e.averageRating)) :
                               100;

                return (
                  <TableRow key={entry.userId} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ color: getRankColor(rank) }}>
                          {getRankIcon(rank)}
                        </Box>
                        {rank > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            #{rank}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {entry.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {entry.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {getPlatformChips(entry.codingProfiles)}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {displayValue.toFixed(0)}
                          {activeTab === 1 && ' problems'}
                        {activeTab === 2 && '⭐'}
                          {activeTab === 3 && ' pts'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(displayValue / maxValue) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: rank <= 3 ? 
                              'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)' :
                              'linear-gradient(90deg, #4ecdc4 0%, #45b7d1 100%)'
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
                }
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
