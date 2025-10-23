import React from 'react';
import { collection, deleteDoc, doc, limit as fsLimit, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { 
  Stack, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Card,
  CardContent,
  Chip,
  Box,
  Fade,
  Slide,
  Tooltip,
  Avatar,
  Alert,
  IconButton
} from '@mui/material';
import { 
  EditOutlined as EditOutlinedIcon,
  DeleteOutline as DeleteOutlineIcon,
  NotificationsOutlined,
  AccessTimeOutlined,
  MoreVertOutlined
} from '@mui/icons-material';

type Notice = { id: string; title: string; body: string; createdAt?: string };

export default function NoticeList({ admin = false, maxItems }: { admin?: boolean; maxItems?: number }) {
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [editing, setEditing] = React.useState<Notice | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editBody, setEditBody] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query(
      collection(db, 'notices') as any,
      orderBy('createdAtTs', 'desc'),
      ...(maxItems ? [fsLimit(maxItems) as any] : [])
    );
    
    const unsub = onSnapshot(q, 
      (snap) => {
      const arr: Notice[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setNotices(arr);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to load notices');
        setLoading(false);
        console.error('Error loading notices:', err);
      }
    );
    
    return () => unsub();
  }, [maxItems]);

  const startEdit = (n: Notice) => {
    setEditing(n);
    setEditTitle(n.title);
    setEditBody(n.body);
  };

  const saveEdit = async () => {
    if (!editing || !editTitle.trim() || !editBody.trim()) return;
    
    try {
    await updateDoc(doc(db, 'notices', editing.id), {
        title: editTitle.trim(),
        body: editBody.trim(),
    });
    setEditing(null);
    } catch (err) {
      console.error('Error updating notice:', err);
    }
  };

  const deleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice? This action cannot be undone.')) return;
    
    try {
    await deleteDoc(doc(db, 'notices', id));
    } catch (err) {
      console.error('Error deleting notice:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Loading notices...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {notices.length === 0 ? (
        <Fade in timeout={600}>
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 2,
            m: 2
          }}>
            <NotificationsOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No notices yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first notice to get started
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 2
        }}>
          {notices.map((notice, index) => (
            <Box key={notice.id}>
              <Slide direction="up" in timeout={800 + index * 100}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ flex: 1, p: 2 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        width: 32, 
                        height: 32,
                        fontSize: '0.875rem'
                      }}>
                        <NotificationsOutlined fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            mb: 0.5,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {notice.title}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip 
                            icon={<AccessTimeOutlined />}
                            label={getTimeAgo(notice.createdAt)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Stack>
                      </Box>
                      {admin && (
                        <Box>
                          <Tooltip title="More options">
                            <IconButton size="small">
                              <MoreVertOutlined />
                </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Stack>

                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5
                      }}
                    >
                      {notice.body}
                    </Typography>

                    {admin && (
                      <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                        <Tooltip title="Edit notice">
                          <Button
                            size="small"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => startEdit(notice)}
                            variant="outlined"
                            sx={{ flex: 1 }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete notice">
                          <Button
                            size="small"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => deleteNotice(notice.id)}
                            variant="outlined"
                            color="error"
                            sx={{ flex: 1 }}
                          >
                            Delete
                          </Button>
                        </Tooltip>
              </Stack>
                    )}
                  </CardContent>
                </Card>
              </Slide>
            </Box>
          ))}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={!!editing} 
        onClose={() => setEditing(null)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <EditOutlinedIcon />
          Edit Notice
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Notice Title" 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)} 
              fullWidth 
              placeholder="Enter a descriptive title..."
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
            <TextField 
              label="Notice Description" 
              value={editBody} 
              onChange={e => setEditBody(e.target.value)} 
              fullWidth 
              multiline 
              minRows={4}
              placeholder="Provide detailed information about the notice..."
              InputProps={{
                sx: { borderRadius: 2 }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setEditing(null)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={saveEdit}
            disabled={!editTitle.trim() || !editBody.trim()}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}