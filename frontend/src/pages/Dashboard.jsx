import React, { useMemo } from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Avatar, Paper } from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    Grade as GradeIcon,
    BarChart as AnalyticsIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const Dashboard = ({ data }) => {
    const stats = useMemo(() => {
        if (!data || !data.results) return null;
        const count = data.results.length;
        const passed = data.results.filter(s => {
            const hasF = Object.values(s.grades).some(g => g === 'F');
            return !hasF && s.sgpa && parseFloat(s.sgpa) > 0;
        }).length;
        const avgSgpa = (data.results.reduce((acc, s) => acc + (parseFloat(s.sgpa) || 0), 0) / count).toFixed(2);
        return { count, passRate: ((passed / count) * 100).toFixed(1), avgSgpa };
    }, [data]);

    const columns = useMemo(() => {
        const baseCols = [
            { field: 'regdNo', headerName: 'Regd. No', width: 130, pinned: 'left' },
            { field: 'sgpa', headerName: 'SGPA', width: 90, type: 'number' },
            { field: 'cgpa', headerName: 'CGPA', width: 90, type: 'number' },
        ];

        const subjectCols = data.subjects.map(sub => ({
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
        return data.results.map((r, i) => {
            const row = { id: i, regdNo: r.regdNo, sgpa: r.sgpa, cgpa: r.cgpa };
            data.subjects.forEach(sub => {
                row[`sub_${sub}`] = r.grades[sub] || '-';
            });
            return row;
        });
    }, [data]);

    const failRate = (100 - parseFloat(stats?.passRate || 0)).toFixed(1);

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
