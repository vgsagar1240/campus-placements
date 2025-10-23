import React from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../src/firebase/firebase";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Fade,
  Slide,
  CircularProgress,
  Divider,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { GridLegacy as Grid } from '@mui/material';

import {
  NotificationsOutlined,
  AccessTimeOutlined,
  AnnouncementOutlined,
  SchoolOutlined,
  PushPin,
} from "@mui/icons-material";

export default function NoticeBoardPage() {
  const [notices, setNotices] = React.useState<
    Array<{ id: string; title: string; body: string; createdAt?: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    const qy = query(
      collection(db, "notices") as any,
      orderBy("createdAtTs", "desc")
    );
    const unsub = onSnapshot(
      qy,
      (snap) => {
        setNotices(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  // Function to generate random rotation for notices
  const getRandomRotation = () => {
    return Math.floor(Math.random() * 7) - 3; // Returns between -3 and 3 degrees
  };

  return (
    <Box sx={{ 
      width: "100%", 
      pb: 4,
      background: "linear-gradient(135deg, #0c3483 0%, #2a75b3 100%)",
      minHeight: "100vh",
      px: { xs: 1, sm: 2 },
      py: { xs: 1, sm: 2 },
    }}>
      {/* Modern Blue Background */}
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
        <Paper
          elevation={12}
          sx={{
            background: `
              linear-gradient(to bottom, #f5f9ff 0%, #e6f0ff 100%)
            `,
            border: "1px solid #a7c7ff",
            borderRadius: "12px",
            p: { xs: 2, sm: 3, md: 4 },
            position: "relative",
            minHeight: "80vh",
            boxShadow: "0 8px 32px rgba(0, 82, 204, 0.2)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #0066cc 0%, #0099ff 100%)",
              borderRadius: "12px 12px 0 0",
            }
          }}
        >
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
            <Fade in timeout={800}>
              <Box>
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  justifyContent="center" 
                  spacing={1}
                  sx={{ mb: 1 }}
                >
                  <AnnouncementOutlined sx={{ 
                    fontSize: { xs: 28, sm: 32, md: 36 }, 
                    color: "#0066cc" 
                  }} />
                  <Typography 
                    variant={isMobile ? "h4" : "h3"}
                    sx={{ 
                      fontWeight: 800, 
                      color: "#0066cc",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" }
                    }}
                  >
                    Notice Board
                  </Typography>
                </Stack>
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  sx={{ 
                    color: "#4d88cf", 
                    mt: 1,
                    fontSize: { xs: "0.9rem", sm: "1rem" }
                  }}
                >
                  Stay updated with the latest announcements
                </Typography>
                <Chip
                  icon={<SchoolOutlined />}
                  label={`${notices.length} Notices Posted`}
                  sx={{
                    background: "rgba(0, 102, 204, 0.1)",
                    color: "#0066cc",
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    mt: 2,
                    border: "1px solid rgba(0, 102, 204, 0.3)",
                    height: { xs: 32, sm: 36 },
                  }}
                />
              </Box>
            </Fade>
          </Box>

          {/* Content Section */}
          <Slide direction="up" in timeout={1000}>
            <Box sx={{ width: "100%" }}>
              {loading ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  minHeight="40vh"
                >
                  <CircularProgress
                    size={50}
                    thickness={4}
                    sx={{ color: "#0066cc", mb: 2 }}
                  />
                  <Typography variant="body1" color="#4d88cf">
                    Loading notices...
                  </Typography>
                </Box>
              ) : notices.length === 0 ? (
                <Fade in timeout={600}>
                  <Box
                    sx={{
                      p: { xs: 4, sm: 6 },
                      textAlign: "center",
                    }}
                  >
                    <NotificationsOutlined
                      sx={{ 
                        fontSize: { xs: 48, sm: 64 }, 
                        color: "#99c2ff", 
                        mb: 2 
                      }}
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      color="#4d88cf" 
                      sx={{ mb: 1 }}
                    >
                      No notices available
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="#66a3ff"
                      sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      Check back later for important announcements and updates.
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <Grid 
                  container 
                  spacing={3} 
                  justifyContent="flex-start"
                  sx={{ 
                    mx: 0,
                    width: "100%",
                  }}
                >
                  {notices.map((notice, index) => (
                    <Grid 
                      key={notice.id} 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4} 
                      lg={3}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Slide direction="up" in timeout={800 + index * 120}>
                        <Box
                          sx={{
                            position: "relative",
                            transform: `rotate(${getRandomRotation()}deg)`,
                            transition: "transform 0.3s ease",
                            width: "100%",
                            maxWidth: 400,
                            "&:hover": {
                              transform: `rotate(0deg) scale(1.05)`,
                              zIndex: 10,
                            },
                          }}
                        >
                          {/* Push pin */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: -10,
                              left: "50%",
                              transform: "translateX(-50%)",
                              zIndex: 2,
                              color: "#0066cc",
                              fontSize: 28,
                              filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))",
                            }}
                          >
                            <PushPin />
                          </Box>
                          
                          {/* Notice card */}
                          <Card
                            elevation={3}
                            sx={{
                              background: "linear-gradient(to bottom, #ffffff 0%, #f0f7ff 100%)",
                              borderRadius: "8px",
                              border: "1px solid #cce5ff",
                              overflow: "visible",
                              mt: 2,
                              position: "relative",
                              width: "100%",
                              minHeight: 200,
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: -5,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 10,
                                height: 10,
                                backgroundColor: "#0066cc",
                                borderRadius: "50%",
                              },
                            }}
                          >
                            <CardContent sx={{ 
                              p: { xs: 2, sm: 2.5 },
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                            }}>
                              <Stack
                                direction="column"
                                spacing={1.5}
                                sx={{ 
                                  mb: 2,
                                  flex: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant={isMobile ? "subtitle1" : "h6"}
                                    sx={{
                                      fontWeight: 700,
                                      mb: 1,
                                      lineHeight: 1.3,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      color: "#003366",
                                      fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" }
                                    }}
                                  >
                                    {notice.title}
                                  </Typography>
                                  <Chip
                                    icon={<AccessTimeOutlined />}
                                    label={getTimeAgo(notice.createdAt)}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      fontSize: "0.7rem",
                                      height: 24,
                                      bgcolor: "rgba(0, 102, 204, 0.1)",
                                      color: "#0066cc",
                                      borderColor: "rgba(0, 102, 204, 0.3)"
                                    }}
                                  />
                                </Box>
                              </Stack>

                              <Divider sx={{ 
                                mb: 2, 
                                borderColor: "rgba(0, 102, 204, 0.2)",
                                borderWidth: 1 
                              }} />

                              <Typography
                                variant="body2"
                                sx={{
                                  lineHeight: 1.6,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 5,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  whiteSpace: "pre-wrap",
                                  color: "#334d4d",
                                  fontFamily: "'Roboto', sans-serif",
                                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                                  flex: 1,
                                }}
                              >
                                {notice.body}
                              </Typography>
                              
                              {/* Clean bottom edge instead of torn paper */}
                              <Box
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: "4px",
                                  background: "linear-gradient(90deg, #0066cc 0%, #0099ff 100%)",
                                  borderRadius: "0 0 8px 8px",
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Box>
                      </Slide>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Slide>
        </Paper>
      </Container>
    </Box>
  );
}