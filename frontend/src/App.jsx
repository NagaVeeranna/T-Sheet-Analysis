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
    Button
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    BarChart as AnalyticsIcon,
    CloudUpload as UploadIcon,
    ChevronLeft as ChevronLeftIcon,
    Subject as SubjectIcon
} from '@mui/icons-material';

import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SubjectDetail from './pages/SubjectDetail';
import UploadZone from './components/UploadZone';

const drawerWidth = 240;

const Layout = ({ children, data, onUpload }) => {
    const [open, setOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    ];

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

                    {data && (
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
                                {data.subjects.map((subject) => (
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

const App = () => {
    const [data, setData] = useState(null);

    return (
        <Router>
            <Layout data={data} onUpload={setData}>
                <Routes>
                    <Route path="/" element={
                        data ? <Dashboard data={data} /> : <UploadZone onUpload={setData} />
                    } />
                    <Route path="/analytics" element={<Analytics data={data} />} />
                    <Route path="/subject/:subjectName" element={<SubjectDetail data={data} />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
