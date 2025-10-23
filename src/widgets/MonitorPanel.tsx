import React from 'react';
import dynamic from 'next/dynamic';
import { 
  Box, 
  Typography, 
  Stack, 
  TextField, 
  Button, 
  Card, 
  CardContent,
  Chip,
  Fade,
  Slide,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import { 
  QrCode2Outlined, 
  DownloadOutlined, 
  PrintOutlined, 
  AddOutlined,
  NotificationsOutlined,
  ManageSearchOutlined
} from '@mui/icons-material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import NoticeList from './NoticeList';
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

export default function MonitorPanel() {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [noticeUrl, setNoticeUrl] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const qrBoxRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setNoticeUrl(`${window.location.origin}/notice`);
    }
  }, []);

  const createNotice = async () => {
    if (!title.trim() || !body.trim()) {
      setSnackbar({ open: true, message: 'Please fill in both title and description', severity: 'warning' });
      return;
    }
    try {
      setCreating(true);
      await addDoc(collection(db, 'notices'), {
        title: title.trim(),
        body: body.trim(),
        createdAt: new Date().toISOString(),
        createdAtTs: serverTimestamp(),
      });
      setTitle('');
      setBody('');
      setSnackbar({ open: true, message: 'Notice posted successfully!', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to post notice', severity: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      {/* Header Section */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700, 
            mb: 1, 
            background: 'linear-gradient(45deg, #2f6fed 30%, #6c63ff 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          }}>
            Notice Board Management
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
            Create, manage, and share notices with QR code access
          </Typography>
        </Box>
      </Fade>

      <Stack spacing={3}>
        {/* Top Row - QR Code and Create Notice */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          {/* QR Code Section */}
          <Box sx={{ flex: 1 }}>
            <Slide direction="up" in timeout={800}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <QrCode2Outlined color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      QR Code Access
                    </Typography>
                    <Chip 
                      label="Live" 
                      color="success" 
                      size="small" 
                      sx={{ ml: 'auto' }}
                    />
                  </Stack>
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={3} 
                    alignItems="center"
                    sx={{ mb: 3 }}
                  >
                    <Box 
                      ref={qrBoxRef} 
                      sx={{ 
                        bgcolor: '#fff', 
                        p: 2, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <QRCode value={noticeUrl || 'about:blank'} size={160} />
                    </Box>
                    
                    <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                      <TextField 
                        label="Notice Board URL" 
                        value={noticeUrl || ''} 
                        fullWidth 
                        InputProps={{ 
                          readOnly: true,
                          sx: { 
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0,0,0,0.1)'
                            }
                          }
                        }} 
                      />
                      
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Tooltip title="Download QR Code as SVG">
                          <Button 
                            variant="outlined" 
                            startIcon={<DownloadOutlined />}
                            onClick={() => {
                              const svg = qrBoxRef.current?.querySelector('svg');
                              if (!svg) return;
                              const data = new XMLSerializer().serializeToString(svg);
                              const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'notice-qr.svg';
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            sx={{ flex: 1 }}
                          >
                            Download
                          </Button>
                        </Tooltip>
                        
                        <Tooltip title="Print QR Code">
                          <Button 
                            variant="outlined" 
                            startIcon={<PrintOutlined />}
                            onClick={() => {
                              const svg = qrBoxRef.current?.querySelector('svg');
                              if (!svg) return;
                              const data = new XMLSerializer().serializeToString(svg);
                              const w = window.open('', 'print');
                              if (!w) return;
                              w.document.write(`
                                <html>
                                  <head>
                                    <title>Notice Board QR Code</title>
                                    <style>
                                      body { 
                                        display: flex; 
                                        align-items: center; 
                                        justify-content: center; 
                                        height: 100vh; 
                                        margin: 0;
                                        font-family: Arial, sans-serif;
                                      }
                                      .container { text-align: center; }
                                      h1 { color: #2f6fed; margin-bottom: 20px; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="container">
                                      <h1>Campus Placements Notice Board</h1>
                                      ${data}
                                    </div>
                                  </body>
                                </html>
                              `);
                              w.document.close();
                              w.focus();
                              w.print();
                            }}
                            sx={{ flex: 1 }}
                          >
                            Print
                          </Button>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Slide>
          </Box>

          {/* Create Notice Section */}
          <Box sx={{ flex: 1 }}>
            <Slide direction="up" in timeout={1000}>
              <Card 
                elevation={2} 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <AddOutlined sx={{ color: 'white', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                      Create New Notice
                    </Typography>
                  </Stack>
                  
                  <Stack spacing={3}>
                    <TextField 
                      label="Notice Title" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      fullWidth 
                      placeholder="Enter a descriptive title..."
                      InputProps={{
                        sx: { 
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          }
                        }
                      }}
                    />
                    
                    <TextField 
                      label="Notice Description" 
                      value={body} 
                      onChange={e => setBody(e.target.value)} 
                      fullWidth 
                      multiline 
                      minRows={4}
                      placeholder="Provide detailed information about the notice..."
                      InputProps={{
                        sx: { 
                          bgcolor: 'rgba(255,255,255,0.9)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.3)'
                          }
                        }
                      }}
                    />
                    
                    <Button 
                      variant="contained" 
                      onClick={createNotice} 
                      disabled={creating || !title.trim() || !body.trim()}
                      startIcon={<NotificationsOutlined />}
                      sx={{ 
                        py: 1.5,
                        background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
                        },
                        '&:disabled': {
                          background: 'rgba(255,255,255,0.3)',
                          color: 'rgba(255,255,255,0.7)'
                        }
                      }}
                    >
                      {creating ? 'Publishing Notice...' : 'Publish Notice'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Slide>
          </Box>
        </Stack>

        {/* Manage Notices Section */}
        <Slide direction="up" in timeout={1200}>
          <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ManageSearchOutlined sx={{ fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Manage Notices
                  </Typography>
                  <Chip 
                    label="Admin Panel" 
                    color="default" 
                    size="small" 
                    sx={{ 
                      ml: 'auto',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  />
                </Stack>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <NoticeList admin maxItems={20} />
              </Box>
            </CardContent>
          </Card>
        </Slide>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

