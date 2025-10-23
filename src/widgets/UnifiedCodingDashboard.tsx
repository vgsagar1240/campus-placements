import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
 
  CircularProgress,
  IconButton,
  Tooltip,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  OpenInNew as OpenInNewIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  Timer as TimerIcon,
  CalendarToday as CalendarIcon,
  Psychology as PsychologyIcon,
  Bolt as BoltIcon
} from '@mui/icons-material';
import { dailyQuestionService, QuestionStats } from '../services/dailyQuestionService';
import { profileSyncService, PlatformProfile } from '../services/profileSyncService';
import { useAuth } from '../contexts/AuthContext';
import ProfileManagement from './ProfileManagement';

// Platform configuration
const PLATFORM_CONFIG = {
  leetcode: {
    name: 'LeetCode',
    color: '#ffa116',
    icon: '🧮',
    gradient: 'linear-gradient(135deg, #ffa116 0%, #ff6b35 100%)',
    url: 'https://leetcode.com/problemset/all/'
  },
  hackerrank: {
    name: 'HackerRank',
    color: '#2ec866',
    icon: '💻',
    gradient: 'linear-gradient(135deg, #2ec866 0%, #1e9c4a 100%)',
    url: 'https://www.hackerrank.com/domains/algorithms'
  },
  codechef: {
    name: 'CodeChef',
    color: '#7b2cbf',
    icon: '🍽️',
    gradient: 'linear-gradient(135deg, #7b2cbf 0%, #5a189a 100%)',
    url: 'https://www.codechef.com/problems/school'
  }
};

// Enhanced Stats Card Component
const StatsCard = ({ icon, value, label, color, delay = 0 }) => (
  <Slide direction="up" in timeout={800 + delay}>
    <Paper 
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
        }
      }}
    >
      <Box sx={{ color, mb: 2 }}>
        {React.cloneElement(icon, { sx: { fontSize: { xs: 32, sm: 40 } } })}
      </Box>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 800, 
          color,
          fontSize: { xs: '1.75rem', sm: '2.25rem' },
          lineHeight: 1.2
        }}
      >
        {value}
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          fontWeight: 600,
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        {label}
      </Typography>
    </Paper>
  </Slide>
);

// Platform Card Component
const PlatformCard = ({ 
  profile, 
  dailyQuestion, 
  onMarkComplete, 
  onVisitProfile, 
  delay = 0 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const config = PLATFORM_CONFIG[profile.platform] || {
    name: profile.platform,
    color: '#666',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #666 0%, #444 100%)',
    url: '#'
  };

  return (
    <Fade in timeout={600 + delay}>
      <Paper 
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          background: 'white',
          border: '2px solid',
          borderColor: alpha(config.color, 0.2),
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 24px 48px ${alpha(config.color, 0.15)}`,
            borderColor: alpha(config.color, 0.4),
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: config.gradient,
          }
        }}
      >
        {/* Platform Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <Avatar 
            sx={{ 
              background: config.gradient,
              width: { xs: 44, sm: 52 },
              height: { xs: 44, sm: 52 },
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              boxShadow: `0 4px 20px ${alpha(config.color, 0.3)}`,
            }}
          >
            {config.icon}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                lineHeight: 1.3
              }}
            >
              {config.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              @{profile.username || 'Unknown'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => onVisitProfile(profile.profileUrl)}
            sx={{ 
              color: config.color,
              '&:hover': {
                backgroundColor: alpha(config.color, 0.1),
              }
            }}
          >
            <OpenInNewIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Stack>

        {/* Daily Question Section */}
        {dailyQuestion && (
          <Box sx={{ 
            mb: 3, 
            p: { xs: 1.5, sm: 2 }, 
            borderRadius: 3, 
            backgroundColor: alpha(config.color, 0.05),
            border: `1px solid ${alpha(config.color, 0.2)}`
          }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CalendarIcon sx={{ 
                fontSize: { xs: 14, sm: 16 }, 
                color: config.color 
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: config.color,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Today's Challenge
              </Typography>
            </Stack>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 1, 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.4
              }}
            >
              {dailyQuestion.title}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2, 
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {dailyQuestion.description}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
              <Chip
                label={dailyQuestion.difficulty}
                size="small"
                color={
                  dailyQuestion.difficulty === 'Easy' ? 'success' : 
                  dailyQuestion.difficulty === 'Medium' ? 'warning' : 'error'
                }
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                  height: { xs: 18, sm: 20 },
                  fontWeight: 600
                }}
              />
              {dailyQuestion.acceptanceRate && (
                <Chip
                  label={`${dailyQuestion.acceptanceRate.toFixed(1)}%`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                    height: { xs: 18, sm: 20 },
                    borderColor: config.color,
                    color: config.color
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="contained"
                startIcon={<OpenInNewIcon />}
                onClick={() => window.open(dailyQuestion.url, '_blank')}
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  py: { xs: 0.25, sm: 0.5 },
                  px: { xs: 1, sm: 1.5 },
                  background: config.gradient,
                  '&:hover': {
                    background: config.gradient,
                    opacity: 0.9,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Solve Challenge
              </Button>
              
              {!dailyQuestion.isCompleted && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onMarkComplete(profile.platform)}
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    py: { xs: 0.25, sm: 0.5 },
                    px: { xs: 1, sm: 1.5 },
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': {
                      borderColor: 'success.dark',
                      backgroundColor: alpha('#10b981', 0.1),
                    }
                  }}
                >
                  Mark Done
                </Button>
              )}
              
              {dailyQuestion.isCompleted && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Completed"
                  size="small"
                  color="success"
                  variant="filled"
                  sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 24, sm: 28 }
                  }}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Progress Section */}
        <Stack spacing={2} sx={{ mb: 3, flex: 1 }}>
          {/* Platform-specific main metric */}
          {profile.platform === 'leetcode' ? (
            <>
              {/* LeetCode: Problems Solved */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Problems Solved
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: config.color,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.problemsSolved || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.problemsSolved || 0) / 500) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(config.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: config.gradient
                    }
                  }}
                />
              </Box>

              {/* LeetCode: Difficulty Breakdown */}
              {(profile.easySolved || profile.mediumSolved || profile.hardSolved) && (
                <Box>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 1 }}
                  >
                    Difficulty Breakdown
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                          Easy
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {profile.easySolved || 0}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(((profile.easySolved || 0) / 200) * 100, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha('#10b981', 0.2),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            backgroundColor: '#10b981'
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                          Medium
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {profile.mediumSolved || 0}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(((profile.mediumSolved || 0) / 100) * 100, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha('#f59e0b', 0.2),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            backgroundColor: '#f59e0b'
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600 }}>
                          Hard
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {profile.hardSolved || 0}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(((profile.hardSolved || 0) / 50) * 100, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha('#ef4444', 0.2),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            backgroundColor: '#ef4444'
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Box>
              )}

              {/* LeetCode: Contest Rating */}
              {profile.contestRating && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Contest Rating
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: config.color,
                        fontSize: { xs: '0.875rem', sm: '1.125rem' }
                      }}
                    >
                      {profile.contestRating}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(((profile.contestRating || 0) / 3000) * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(config.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: config.gradient
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : profile.platform === 'hackerrank' ? (
            <>
              {/* HackerRank: Points */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Points
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: config.color,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.score || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.score || 0) / 2500) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(config.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: config.gradient
                    }
                  }}
                />
              </Box>

              {/* HackerRank: Problems Solved */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Problems Solved
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.problemsSolved || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.problemsSolved || 0) / 300) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(config.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: config.gradient
                    }
                  }}
                />
              </Box>

              {/* HackerRank: Skill Rating */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Skill Rating
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: config.color,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.rating || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.rating || 0) / 1600) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(config.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: config.gradient
                    }
                  }}
                />
              </Box>
            </>
          ) : profile.platform === 'codechef' ? (
            <>
              {/* CodeChef: Rating */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Rating
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: config.color,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.rating || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.rating || 0) / 3000) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(config.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: config.gradient
                    }
                  }}
                />
              </Box>

              {/* CodeChef: Problems Solved */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Problems Solved
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.problemsSolved || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.problemsSolved || 0) / 400) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(config.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: config.gradient
                    }
                  }}
                />
              </Box>

              {/* CodeChef: Stars */}
              {(profile.stars && profile.stars > 0) && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Stars
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: config.color,
                        fontSize: { xs: '0.875rem', sm: '1.125rem' }
                      }}
                    >
                      {'★'.repeat(Math.max(0, profile.stars || 0))}{'☆'.repeat(Math.max(0, 5 - (profile.stars || 0)))}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.max(0, Math.min(100, ((profile.stars || 0) / 5) * 100))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(config.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: config.gradient
                      }
                    }}
                  />
                </Box>
              )}

              {/* CodeChef: Contests */}
              {profile.contestsParticipated && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Contests Participated
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: config.color,
                        fontSize: { xs: '0.875rem', sm: '1.125rem' }
                      }}
                    >
                      {profile.contestsParticipated}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(((profile.contestsParticipated || 0) / 50) * 100, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(config.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: config.gradient
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            // Fallback for unknown platforms
            <>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Platform Score
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: config.color,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.score || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.score || 0) / 3000) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(config.color, 0.2),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: config.gradient
                    }
                  }}
                />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Problems Solved
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '0.875rem', sm: '1.125rem' }
                    }}
                  >
                    {profile.problemsSolved || 0}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(((profile.problemsSolved || 0) / 500) * 100, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'grey.100',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: config.gradient
                    }
                  }}
                />
              </Box>
            </>
          )}

        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={1} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <PsychologyIcon sx={{ 
                fontSize: { xs: 20, sm: 24 }, 
                color: 'primary.main',
                mb: 0.5
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  fontSize: { xs: '0.875rem', sm: '1.125rem' }
                }}
              >
                {profile.rating || 0}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Rating
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <TrophyIcon sx={{ 
                fontSize: { xs: 20, sm: 24 }, 
                color: 'warning.main',
                mb: 0.5
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'warning.main',
                  fontSize: { xs: '0.875rem', sm: '1.125rem' }
                }}
              >
                #{profile.rank || 'N/A'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Rank
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <BoltIcon sx={{ 
                fontSize: { xs: 20, sm: 24 }, 
                color: 'success.main',
                mb: 0.5
              }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'success.main',
                  fontSize: { xs: '0.875rem', sm: '1.125rem' }
                }}
              >
                {profile.streak || 0}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Streak
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box sx={{ textAlign: 'center', p: 1 }}>
              <TimerIcon sx={{ 
                fontSize: { xs: 20, sm: 24 }, 
                color: 'info.main',
                mb: 0.5
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {profile.lastActive || 'N/A'}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                Last Active
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Action Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<OpenInNewIcon />}
          onClick={() => onVisitProfile(profile.profileUrl)}
          sx={{
            borderRadius: 3,
            py: 1.5,
            background: config.gradient,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 600,
            '&:hover': {
              background: config.gradient,
              opacity: 0.9,
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 24px ${alpha(config.color, 0.3)}`,
            },
            transition: 'all 0.3s ease'
          }}
        >
          View Full Profile
        </Button>
      </Paper>
    </Fade>
  );
};

export default function UnifiedCodingDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [, setStats] = useState<QuestionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [profileManagementOpen, setProfileManagementOpen] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<{[key: string]: any}>({});

  const loadProfiles = useCallback(async () => {
    if (user) {
      try {
        const savedProfiles = await profileSyncService.getUserProfiles(user.uid);
        setProfiles(savedProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfiles([]);
      }
    }
  }, [user]);

  const loadStats = useCallback(() => {
    if (user) {
      const userStats = dailyQuestionService.getUserStats(user.uid);
      setStats(userStats);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadStats();
      loadDailyQuestions();
    }
  }, [user, loadProfiles, loadStats]);

  const loadDailyQuestions = async () => {
    try {
      const [leetcodeQuestion, hackerrankQuestion, codechefQuestion] = await Promise.all([
        dailyQuestionService.getLeetCodeQuestion(),
        dailyQuestionService.getHackerRankQuestion(),
        dailyQuestionService.getCodeChefQuestion()
      ]);
      
      setDailyQuestions({
        leetcode: leetcodeQuestion,
        hackerrank: hackerrankQuestion,
        codechef: codechefQuestion
      });
    } catch (error) {
      console.error('Error loading daily questions:', error);
    }
  };

  const handleSyncProfiles = async () => {
    setSyncing(true);
    try {
      await loadProfiles();
      await loadDailyQuestions();
    } catch (error) {
      console.error('Error syncing profiles:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleProfilesUpdated = (updatedProfiles: PlatformProfile[]) => {
    setProfiles(updatedProfiles);
  };

  const handleMarkQuestionCompleted = async (platform: string) => {
    if (user && dailyQuestions[platform]) {
      await dailyQuestionService.markQuestionCompleted(dailyQuestions[platform].id, user.uid);
      loadStats();
    }
  };

  const handleVisitProfile = (url: string) => {
    window.open(url, '_blank');
  };

  // Calculate overall stats
  const totalScore = profiles.reduce((sum, profile) => sum + (profile.score || 0), 0);
  const totalProblems = profiles.reduce((sum, profile) => sum + (profile.problemsSolved || 0), 0);
  const averageRating = profiles.length > 0 
    ? Math.floor(profiles.reduce((sum, profile) => sum + (profile.rating || 0), 0) / profiles.length)
    : 0;
  const bestPlatform = profiles.length > 0 
    ? profiles.reduce((best, profile) => 
        (profile.score || 0) > (best.score || 0) ? profile : best
      ).platform 
    : 'None';

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
            Loading Coding Dashboard...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Preparing your coding journey overview
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {/* Header Section */}
        <Box sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          p: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }
        }}>
          <Box position="relative">
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
              spacing={3}
            >
              <Stack direction="row" alignItems="center" spacing={3}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: { xs: 56, sm: 64 }, 
                  height: { xs: 56, sm: 64 },
                  backdropFilter: 'blur(10px)',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}>
                  <CodeIcon />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: '1.75rem', sm: '2.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Coding Dashboard
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.9,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 400
                    }}
                  >
                    Track your progress across coding platforms
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1}>
                <Tooltip title="Sync All Profiles">
                  <IconButton 
                    onClick={handleSyncProfiles} 
                    disabled={syncing}
                    sx={{ 
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    {syncing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Manage Profiles">
                  <IconButton 
                    onClick={() => setProfileManagementOpen(true)}
                    sx={{ 
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Overall Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatsCard
                icon={<TrophyIcon />}
                value={totalScore}
                label="Total Score"
                color="#f59e0b"
                delay={0}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatsCard
                icon={<CheckCircleIcon />}
                value={totalProblems}
                label="Problems Solved"
                color="#10b981"
                delay={100}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatsCard
                icon={<StarIcon />}
                value={averageRating}
                label="Average Rating"
                color="#3b82f6"
                delay={200}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6, md: 3 }}>
              <StatsCard
                icon={<TrendingUpIcon />}
                value={bestPlatform}
                label="Best Platform"
                color="#8b5cf6"
                delay={300}
              />
            </Grid>
          </Grid>

          {/* Platform Profiles Section */}
          <Box sx={{ mb: 4 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between" 
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' }
                }}
              >
                Your Coding Profiles
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setProfileManagementOpen(true)}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600
                }}
              >
                Add Profile
              </Button>
            </Stack>
            
            {profiles.length === 0 ? (
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 4, sm: 6 }, 
                  textAlign: 'center', 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '2px dashed',
                  borderColor: 'divider'
                }}
              >
                <CodeIcon sx={{ 
                  fontSize: { xs: 48, sm: 64 }, 
                  color: 'text.secondary', 
                  mb: 2,
                  opacity: 0.5
                }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                  }}
                >
                  No Coding Profiles Found
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Connect your coding platform accounts to track progress
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setProfileManagementOpen(true)}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    fontWeight: 600
                  }}
                >
                  Add Your First Profile
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {profiles.map((profile, index) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={profile.platform}>
                    <PlatformCard
                      profile={profile}
                      dailyQuestion={dailyQuestions[profile.platform]}
                      onMarkComplete={handleMarkQuestionCompleted}
                      onVisitProfile={handleVisitProfile}
                      delay={index * 100}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Quick Actions */}
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '1.5rem', sm: '1.75rem' }
              }}
            >
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleSyncProfiles}
                  disabled={syncing}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600
                  }}
                >
                  {syncing ? 'Syncing...' : 'Sync Profiles'}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => window.open('https://leetcode.com/problemset/all/', '_blank')}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600
                  }}
                >
                  Practice Problems
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrophyIcon />}
                  onClick={() => window.open('https://www.hackerrank.com/contests', '_blank')}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600
                  }}
                >
                  Join Contests
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LightbulbIcon />}
                  onClick={() => window.open('https://www.codechef.com/contests', '_blank')}
                  sx={{ 
                    borderRadius: 3, 
                    py: 1.5,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 600
                  }}
                >
                  CodeChef Events
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>

        {/* Profile Management Dialog */}
        <ProfileManagement
          open={profileManagementOpen}
          onClose={() => setProfileManagementOpen(false)}
          onProfilesUpdated={handleProfilesUpdated}
        />
      </Card>
    </Box>
  );
}