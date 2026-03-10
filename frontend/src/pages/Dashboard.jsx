import React, { useMemo, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
    Avatar,
    Paper,
    Button,
    LinearProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    Grade as GradeIcon,
    BarChart as AnalyticsIcon,
    CloudUpload as UploadIcon,
    AutoGraph as WelcomeIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const Dashboard = ({ data, onUpload }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const stats = useMemo(() => {
        if (!data || !data.results || !Array.isArray(data.results)) return null;
        const count = data.results.length;
        if (count === 0) return { count: 0, passRate: '0', avgSgpa: '0' };

        const passed = data.results.filter(s => {
            if (!s.grades) return false;
            const hasF = Object.values(s.grades).some(g => g === 'F' || g === 'fail');
            return !hasF && s.sgpa && parseFloat(s.sgpa) > 0;
        }).length;
        const avgSgpa = (data.results.reduce((acc, s) => acc + (parseFloat(s.sgpa) || 0), 0) / count).toFixed(2);
        return { count, passRate: ((passed / count) * 100).toFixed(1), avgSgpa };
    }, [data]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUpload(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const columns = useMemo(() => {
        const baseCols = [
            { field: 'regdNo', headerName: 'Regd. No', width: 130, pinned: 'left' },
            { field: 'sgpa', headerName: 'SGPA', width: 90, type: 'number' },
            { field: 'cgpa', headerName: 'CGPA', width: 90, type: 'number' },
        ];

        const subjectCols = (data?.subjects || []).map(sub => ({
            field: `sub_${sub}`,
            headerName: sub,
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight={params.value === 'F' ? 'bold' : 'normal'} color={params.value === 'F' ? 'error' : 'inherit'}>
                    {params.value}
                </Typography>
            )
        }));

        return [...baseCols, ...subjectCols];
    }, [data]);

    const rows = useMemo(() => {
        if (!data?.results || !Array.isArray(data?.results)) return [];
        return data.results.map((r, i) => {
            const row = { id: i, regdNo: r.regdNo, sgpa: r.sgpa, cgpa: r.cgpa };
            (data.subjects || []).forEach(sub => {
                row[`sub_${sub}`] = (r.grades && r.grades[sub]) || '-';
            });
            return row;
        });
    }, [data]);

    if (!data) {
        return (
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 8,
                        borderRadius: 6,
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        maxWidth: 700,
                        mx: 'auto'
                    }}
                >
                    <Avatar sx={{
                        width: 90,
                        height: 90,
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 12px 24px rgba(79, 70, 229, 0.25)'
                    }}>
                        <WelcomeIcon sx={{ fontSize: 45 }} />
                    </Avatar>

                    <Typography variant="h3" fontWeight="900" gutterBottom sx={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}>
                        Step Into Excellence
                    </Typography>

                    <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 550, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
                        Upload your university T-Sheet PDF to unlock deep academic insights,
                        student metrics, and automated subject performance reports.
                    </Typography>

                    {uploading && <LinearProgress sx={{ mb: 4, borderRadius: 2, height: 6 }} />}

                    <Button
                        variant="contained"
                        size="large"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{
                            px: 8,
                            py: 2.2,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            fontWeight: '800',
                            textTransform: 'none',
                            fontSize: '1.2rem',
                            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                                boxShadow: '0 8px 30px rgba(79, 70, 229, 0.4)',
                            }
                        }}
                    >
                        Start Your Analysis
                        <input type="file" hidden accept=".pdf" onChange={handleFileUpload} />
                    </Button>

                    {error && (
                        <Paper sx={{ mt: 4, p: 2, bgcolor: 'error.main', color: 'white', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="600">{error}</Typography>
                        </Paper>
                    )}
                </Paper>
            </Box>
        );
    }

    if (!stats) return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Processing Data...</Typography>
            <LinearProgress sx={{ mt: 2, maxWidth: 400, mx: 'auto' }} />
        </Box>
    );

    const failRate = (100 - parseFloat(stats.passRate)).toFixed(1);

    return (
        <Box sx={{ pb: 4 }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Semester Overview</Typography>

            {/* Part 1: Summary Insights */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AnalyticsIcon color="primary" /> Key Performance Indicators
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 4, border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)', color: 'primary.main' }}><PeopleIcon /></Avatar>
                                        <Typography variant="h6" color="text.secondary">Total Students</Typography>
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold">{stats.count}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 4, border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main' }}><SchoolIcon /></Avatar>
                                        <Typography variant="h6" color="text.secondary" noWrap>Pass %</Typography>
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" color="success.main">{stats.passRate}%</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 4, border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main' }}><GradeIcon /></Avatar>
                                        <Typography variant="h6" color="text.secondary" noWrap>Fail %</Typography>
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" color="error.main">{failRate}%</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 4, border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(225, 29, 72, 0.1)', color: 'secondary.main' }}><GradeIcon /></Avatar>
                                        <Typography variant="h6" color="text.secondary" noWrap>Avg. SGPA</Typography>
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" color="secondary.main">{stats.avgSgpa}</Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Part 2: Detailed Results Table */}
            <Box>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GradeIcon color="secondary" /> Student-Subject Matrix
                </Typography>
                <Paper sx={{ height: 650, width: '100%', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={20}
                        rowsPerPageOptions={[20, 50, 100]}
                        disableSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(0, 0, 0, 0.03)' },
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: 'rgba(0, 0, 0, 0.02)',
                                borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' }
                            },
                        }}
                    />
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard;
