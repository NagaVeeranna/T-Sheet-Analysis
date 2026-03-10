import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Container,
    Paper,
    Button,
    Chip,
    Stack,
    Avatar,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    BarChart as AnalyticsIcon,
    CloudUpload as UploadIcon,
    ChevronLeft as ChevronLeftIcon,
    Subject as SubjectIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';

import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SubjectDetail from './pages/SubjectDetail';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

const drawerWidth = 240;

const Layout = ({ children, data, onUpload }) => {
    const [open, setOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    ];

    const handleLogout = () => {
        onUpload(null);
        logout();
        navigate('/');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#4f46e5';
            case 'examcell': return '#059669';
            case 'viewer': return '#d97706';
            default: return '#64748b';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'examcell': return 'Exam Cell';
            case 'viewer': return 'Viewer';
            default: return role;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                <Toolbar>
                    <IconButton color="inherit" aria-label="open drawer" onClick={() => setOpen(!open)} edge="start" sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" fontWeight="bold" color="primary">
                        T-Sheet <Typography component="span" variant="h6" fontWeight="300" color="textSecondary">Analytics</Typography>
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    {user && (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                                label={getRoleLabel(user.role)}
                                size="small"
                                sx={{
                                    bgcolor: `${getRoleColor(user.role)}15`,
                                    color: getRoleColor(user.role),
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                }}
                            />
                            <Typography variant="body2" fontWeight="600" color="text.secondary">
                                {user.display_name}
                            </Typography>

                            {data && user.role !== 'viewer' && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<UploadIcon />}
                                    onClick={() => { navigate('/'); onUpload(null); }}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Upload New
                                </Button>
                            )}

                            <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
                                <LogoutIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    width: open ? drawerWidth : 72,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? drawerWidth : 72,
                        transition: 'width 0.2s ease-in-out',
                        overflowX: 'hidden',
                        borderRight: '1px solid rgba(0,0,0,0.05)',
                        bgcolor: 'background.default'
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'hidden' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    disabled={!data && item.path !== '/'}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 3 : 'auto',
                                            justifyContent: 'center',
                                            color: location.pathname === item.path ? 'primary.main' : 'inherit'
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    {data && open && (
                        <>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="overline" sx={{ px: 3, color: 'text.secondary', fontWeight: 'bold' }}>Subjects</Typography>
                            <List sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {data?.subjects?.map((subject) => (
                                    <ListItem key={subject} disablePadding>
                                        <ListItemButton component={Link} to={`/subject/${encodeURIComponent(subject)}`}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><SubjectIcon fontSize="small" /></ListItemIcon>
                                            <ListItemText primary={subject} primaryTypographyProps={{ variant: 'body2', noWrap: true }} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
                <Toolbar />
                <Container maxWidth="xl">
                    {children}
                </Container>
            </Box>
        </Box>
    );
};

// Robust Error Boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 5, textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a', color: 'white' }}>
                    <Paper elevation={0} sx={{ p: 6, borderRadius: 4, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: 600 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color="error.main">Oops! Something went wrong.</Typography>
                        <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>The application encountered an unexpected error. This usually happens when the uploaded PDF has an irregular format.</Typography>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                localStorage.removeItem('token'); // Clear potentially bad state
                                window.location.href = '/';
                            }}
                            sx={{ borderRadius: 2, px: 4, py: 1 }}
                        >
                            Reset Application
                        </Button>
                        <Typography variant="caption" display="block" sx={{ mt: 4, opacity: 0.5, fontFamily: 'monospace' }}>
                            {this.state.error?.toString()}
                        </Typography>
                    </Paper>
                </Box>
            );
        }
        return this.props.children;
    }
}

const AppContent = () => {
    const [data, setData] = useState(null);
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0f172a' }}>
                <Typography variant="h6" color="white">Loading...</Typography>
            </Box>
        );
    }

    return (
        <ErrorBoundary>
            <Routes>
                {/* Entry Route */}
                <Route path="/" element={
                    user ? (
                        <Layout data={data} onUpload={setData}>
                            <Dashboard data={data} onUpload={setData} />
                        </Layout>
                    ) : (
                        <LandingPage onUpload={setData} />
                    )
                } />

                {/* Login Page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Flow */}
                <Route path="/analytics" element={
                    user ? (
                        <Layout data={data} onUpload={setData}>
                            <Analytics data={data} />
                        </Layout>
                    ) : <LandingPage onUpload={setData} />
                } />

                <Route path="/subject/:subjectName" element={
                    user ? (
                        <Layout data={data} onUpload={setData}>
                            <SubjectDetail data={data} />
                        </Layout>
                    ) : <LandingPage onUpload={setData} />
                } />
            </Routes>
        </ErrorBoundary>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;
