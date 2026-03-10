import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Paper,
    LinearProgress,
    useTheme,
    Chip,
    Stack,
    IconButton,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Assessment as AssessmentIcon,
    PictureAsPdf as PdfIcon,
    Speed as SpeedIcon,
    BarChart as ChartIcon,
    School as SchoolIcon,
    AutoGraph as AutoGraphIcon,
    ArrowForward as ArrowIcon,
    Logout as LogoutIcon,
    Visibility as ViewerIcon,
    Login as LoginIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, title, description, gradient }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3.5,
            borderRadius: 4,
            border: '1px solid rgba(79, 70, 229, 0.08)',
            background: '#ffffff',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 20px 40px rgba(79, 70, 229, 0.12)',
                border: '1px solid rgba(79, 70, 229, 0.15)',
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: gradient,
                borderRadius: '4px 4px 0 0',
            }
        }}
    >
        <Box
            sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: gradient,
                mb: 2.5,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
            }}
        >
            {icon}
        </Box>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 1, fontSize: '1.05rem' }}>
            {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {description}
        </Typography>
    </Paper>
);

const StatBadge = ({ value, label }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="800" color="primary.main" sx={{ lineHeight: 1 }}>
            {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            {label}
        </Typography>
    </Box>
);

const LandingPage = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const theme = useTheme();
    const { user, logout, canUpload } = useAuth();
    const navigate = useNavigate();

    const processFile = async (file) => {
        if (!file || !file.name.endsWith('.pdf')) {
            setError('Please upload a valid PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUpload(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to upload and process PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        processFile(file);
    };

    const features = [
        {
            icon: <PdfIcon sx={{ color: '#fff', fontSize: 26 }} />,
            title: 'PDF Extraction',
            description: 'Automatically parse T-Sheet PDFs and extract student grades, SGPA, and CGPA data.',
            gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        },
        {
            icon: <ChartIcon sx={{ color: '#fff', fontSize: 26 }} />,
            title: 'Visual Analytics',
            description: 'Interactive charts and grade distributions for every subject at a glance.',
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        },
        {
            icon: <AssessmentIcon sx={{ color: '#fff', fontSize: 26 }} />,
            title: 'PDF Reports',
            description: 'Generate professional reports with student details, statistics, and signatures.',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        {
            icon: <SpeedIcon sx={{ color: '#fff', fontSize: 26 }} />,
            title: 'Instant Results',
            description: 'Get pass/fail analysis, subject-wise breakdowns, and top performers instantly.',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        },
    ];

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative background elements */}
            <Box sx={{
                position: 'absolute',
                top: -200,
                right: -200,
                width: 600,
                height: 600,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -150,
                left: -150,
                width: 500,
                height: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Top Navigation Bar */}
            <Box sx={{
                py: 2,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(79, 70, 229, 0.06)',
            }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <AutoGraphIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Typography variant="h6" fontWeight="800" color="primary.main">
                        T-Sheet
                        <Typography component="span" variant="h6" fontWeight="300" color="text.secondary" sx={{ ml: 0.5 }}>
                            Analytics
                        </Typography>
                    </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                    {user ? (
                        <>
                            <Typography variant="body2" fontWeight="600" color="text.secondary">
                                Welcome, {user.display_name}
                            </Typography>
                            <IconButton onClick={logout} size="small" sx={{ color: 'text.secondary' }}>
                                <LogoutIcon fontSize="small" />
                            </IconButton>
                        </>
                    ) : (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LoginIcon />}
                            onClick={() => navigate('/login')}
                            sx={{ borderRadius: 2 }}
                        >
                            Sign In
                        </Button>
                    )}
                </Stack>
            </Box>

            <Container maxWidth="lg">
                {/* Hero Section */}
                <Box sx={{
                    textAlign: 'center',
                    pt: { xs: 6, md: 10 },
                    pb: 6,
                }}>
                    <Chip
                        icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                        label="Result Analysis Made Simple"
                        sx={{
                            mb: 3,
                            py: 2.5,
                            px: 1,
                            bgcolor: 'rgba(79, 70, 229, 0.08)',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            '& .MuiChip-icon': { color: 'primary.main' },
                        }}
                    />

                    <Typography
                        variant="h2"
                        fontWeight="800"
                        sx={{
                            mb: 2.5,
                            fontSize: { xs: '2rem', md: '3.2rem' },
                            lineHeight: 1.2,
                            background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Analyze T-Sheet Results
                        <br />
                        In Seconds
                    </Typography>

                    <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="400"
                        sx={{
                            maxWidth: 580,
                            mx: 'auto',
                            mb: 5,
                            lineHeight: 1.7,
                            fontSize: '1.05rem',
                        }}
                    >
                        Upload your university T-Sheet PDF and get instant analytics —
                        grade distributions, pass/fail stats, subject-wise reports, and downloadable PDFs.
                    </Typography>

                    {/* Upload Section */}
                    {!user ? (
                        <Paper
                            elevation={0}
                            sx={{
                                maxWidth: 620,
                                mx: 'auto',
                                borderRadius: 5,
                                border: '2px dashed rgba(79, 70, 229, 0.15)',
                                background: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(10px)',
                                py: 6,
                                px: 4,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(79, 70, 229, 0.08)',
                                mx: 'auto',
                                mb: 2,
                            }}>
                                <LoginIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                                Authorized Access Only
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Please sign in with your credentials to upload and analyze T-Sheet data.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<LoginIcon />}
                                onClick={() => navigate('/login')}
                                sx={{
                                    borderRadius: 3,
                                    px: 6,
                                    py: 1.5,
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                                        boxShadow: '0 6px 24px rgba(79, 70, 229, 0.4)',
                                    }
                                }}
                            >
                                Sign In to Access
                            </Button>
                        </Paper>
                    ) : canUpload ? (
                        <Paper
                            elevation={0}
                            sx={{
                                maxWidth: 620,
                                mx: 'auto',
                                borderRadius: 5,
                                border: isDragging
                                    ? '2px dashed rgba(79, 70, 229, 0.5)'
                                    : '2px dashed rgba(79, 70, 229, 0.15)',
                                background: isDragging
                                    ? 'rgba(79, 70, 229, 0.03)'
                                    : 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease',
                                overflow: 'hidden',
                                '&:hover': {
                                    border: '2px dashed rgba(79, 70, 229, 0.35)',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                },
                            }}
                        >
                            {loading && <LinearProgress sx={{ borderRadius: 0 }} />}

                            <label htmlFor="upload-landing">
                                <input
                                    accept="application/pdf"
                                    id="upload-landing"
                                    type="file"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                                <Box
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
                                    sx={{
                                        py: 5,
                                        px: 4,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Box sx={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isDragging
                                            ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                                            : 'rgba(79, 70, 229, 0.08)',
                                        transition: 'all 0.3s ease',
                                        mb: 1,
                                    }}>
                                        <UploadIcon sx={{
                                            fontSize: 32,
                                            color: isDragging ? '#fff' : 'primary.main',
                                            transition: 'all 0.3s ease',
                                        }} />
                                    </Box>

                                    <Typography variant="h6" fontWeight="600" color={isDragging ? 'primary.main' : 'text.primary'}>
                                        {isDragging ? 'Drop your PDF here' : 'Upload T-Sheet PDF'}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Drag & drop your file here, or click to browse
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<UploadIcon />}
                                        endIcon={<ArrowIcon />}
                                        component="span"
                                        sx={{
                                            mt: 1,
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.2,
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                                                boxShadow: '0 6px 24px rgba(79, 70, 229, 0.4)',
                                            }
                                        }}
                                    >
                                        Choose File
                                    </Button>
                                </Box>
                            </label>

                            {error && (
                                <Box sx={{ px: 3, pb: 2 }}>
                                    <Paper sx={{ p: 1.5, bgcolor: 'error.main', color: 'white', borderRadius: 2 }}>
                                        <Typography variant="body2">{error}</Typography>
                                    </Paper>
                                </Box>
                            )}
                        </Paper>
                    ) : (
                        <Paper
                            elevation={0}
                            sx={{
                                maxWidth: 620,
                                mx: 'auto',
                                borderRadius: 5,
                                border: '2px dashed rgba(245, 158, 11, 0.3)',
                                background: 'rgba(255, 255, 255, 0.7)',
                                py: 5,
                                px: 4,
                                textAlign: 'center',
                            }}
                        >
                            <Box sx={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(245, 158, 11, 0.1)',
                                mx: 'auto',
                                mb: 2,
                            }}>
                                <ViewerIcon sx={{ fontSize: 32, color: '#d97706' }} />
                            </Box>
                            <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                                View-Only Access
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You are logged in as a Viewer. Contact an Admin or Exam Cell Incharge to upload T-Sheet data.
                            </Typography>
                        </Paper>
                    )}
                </Box>

                {/* Features Section */}
                <Box sx={{ pb: 8 }}>
                    <Typography
                        variant="overline"
                        display="block"
                        textAlign="center"
                        color="primary.main"
                        fontWeight="700"
                        sx={{ letterSpacing: 2, mb: 1 }}
                    >
                        Features
                    </Typography>
                    <Typography variant="h5" fontWeight="700" textAlign="center" sx={{ mb: 5 }}>
                        Everything you need for result analysis
                    </Typography>

                    <Grid container spacing={3}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <FeatureCard {...feature} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Stats Section */}
                <Paper
                    elevation={0}
                    sx={{
                        mb: 8,
                        p: 4,
                        borderRadius: 5,
                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%)',
                        border: '1px solid rgba(79, 70, 229, 0.08)',
                    }}
                >
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={6} sm={3}>
                            <StatBadge value="100+" label="Students" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatBadge value="10+" label="Subjects" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatBadge value="PDF" label="Reports" />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <StatBadge value="⚡" label="Instant" />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', pb: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        Built with ❤️ for Result Analysis
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default LandingPage;
