import React, { useMemo, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    useTheme,
    Button,
    Stack,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    Download as DownloadIcon,
    People as PeopleIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    TrendingUp as TrendIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import aecLogo from '../assets/aec_logo.png';

const SubjectDetail = ({ data }) => {
    const { subjectName } = useParams();
    const theme = useTheme();
    const pdfRef = useRef(null);

    const subject = useMemo(() => {
        return decodeURIComponent(subjectName);
    }, [subjectName]);

    const handleDownloadPDF = async () => {
        const container = pdfRef.current;
        if (!container) return;

        // Temporarily show the hidden element for capture
        const originalDisplay = container.style.display;
        container.style.display = 'block';

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pages = container.querySelectorAll('.pdf-page-chunk');

        for (let i = 0; i < pages.length; i++) {
            const canvas = await html2canvas(pages[i], {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // For first page, we use the existing instance. For others, we add a new page.
            if (i > 0) pdf.addPage();

            // Add image to the full page. We use 0,0 and fit to width.
            // Since our chunk is designed to fit an A4, we scale it to width.
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }

        container.style.display = originalDisplay;
        pdf.save(`${subject.replace(/\s+/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const stats = useMemo(() => {
        if (!data) return null;
        let passedRolls = [];
        let failedRolls = [];
        let allRolls = [];

        data.results.forEach(s => {
            const g = s.grades[subject];
            if (g) {
                const resultStatus = g === 'AB' ? 'Absent' : (g === 'F' ? 'Failed' : 'Passed');
                const studentData = {
                    regdNo: s.regdNo,
                    grade: g,
                    result: resultStatus
                };
                if (g === 'F' || g === 'AB') failedRolls.push(studentData);
                else passedRolls.push(studentData);
                allRolls.push(studentData);
            }
        });

        // Sort all lists by regdNo
        passedRolls.sort((a, b) => a.regdNo.localeCompare(b.regdNo));
        failedRolls.sort((a, b) => a.regdNo.localeCompare(b.regdNo));
        allRolls.sort((a, b) => a.regdNo.localeCompare(b.regdNo));

        const total = allRolls.length;

        // Chunking for PDF: 20 students per page for safer fit on A4
        const chunkSize = 20;
        const chunks = [];
        for (let i = 0; i < allRolls.length; i += chunkSize) {
            chunks.push(allRolls.slice(i, i + chunkSize));
        }

        return {
            total,
            passed: passedRolls.length,
            failed: failedRolls.length,
            passedRolls,
            failedRolls,
            allRolls,
            chunks,
            passPercentage: total > 0 ? ((passedRolls.length / total) * 100).toFixed(1) : 0
        };
    }, [data, subject]);

    const chartData = useMemo(() => {
        if (!data) return [];
        const grades = {};
        data.results.forEach(s => {
            const g = s.grades[subject];
            if (g) grades[g] = (grades[g] || 0) + 1;
        });

        const order = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'S'];
        return order
            .filter(g => grades[g] !== undefined)
            .map(g => ({ name: g, count: grades[g] }));
    }, [data, subject]);

    const rows = useMemo(() => {
        if (!data) return [];
        return data.results
            .filter(s => s.grades[subject])
            .map((s, i) => ({
                id: i,
                regdNo: s.regdNo,
                grade: s.grades[subject],
                sgpa: s.sgpa
            }));
    }, [data, subject]);

    const columns = [
        { field: 'regdNo', headerName: 'Regd. No', width: 150 },
        { field: 'grade', headerName: 'Grade', width: 100 },
        { field: 'sgpa', headerName: 'Semester SGPA', width: 150 },
    ];

    if (!data) return <Navigate to="/" />;
    if (!data.subjects.includes(subject)) return <Typography>Subject not found.</Typography>;

    // Shared table component for side-by-side view in UI
    const StudentTables = () => (
        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                    Passed Students ({stats.passed})
                </Typography>
                <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', fontWeight: 'bold' }}>S.No</TableCell>
                                <TableCell sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', fontWeight: 'bold' }}>Regd. No</TableCell>
                                <TableCell sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', fontWeight: 'bold' }}>Grade</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.passedRolls.map((student, index) => (
                                <TableRow key={student.regdNo} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{student.regdNo}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>{student.grade}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight="bold" color="error.main" gutterBottom>
                    Failed Students ({stats.failed})
                </Typography>
                <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', fontWeight: 'bold' }}>S.No</TableCell>
                                <TableCell sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', fontWeight: 'bold' }}>Regd. No</TableCell>
                                <TableCell sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)', fontWeight: 'bold' }}>Grade</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.failedRolls.length > 0 ? stats.failedRolls.map((student, index) => (
                                <TableRow key={student.regdNo} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{student.regdNo}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>{student.grade}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">None</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );

    return (
        <Box sx={{ pb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="overline" color="primary" fontWeight="bold">Subject Wise Analysis</Typography>
                    <Typography variant="h4" fontWeight="bold">{subject}</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Download PDF
                </Button>
            </Stack>

            {/* Main UI View */}
            <Box sx={{ bgcolor: 'background.default' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }}><PeopleIcon /></Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Total Students</Typography>
                                    <Typography variant="h5" fontWeight="bold">{stats.total}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'success.main' }}><CheckIcon /></Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Passed</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="success.main">{stats.passed}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main' }}><CancelIcon /></Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Failed/Absent</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="error.main">{stats.failed}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: 'warning.main' }}><TrendIcon /></Avatar>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Pass Rate</Typography>
                                    <Typography variant="h5" fontWeight="bold">{stats.passPercentage}%</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={7}>
                        <Paper sx={{ p: 4, borderRadius: 4, height: 450, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">Grade Distribution</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.name === 'F' ? theme.palette.error.main : theme.palette.primary.main}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} lg={5}>
                        <Card sx={{ height: 450, borderRadius: 4, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <CardContent sx={{ height: '100%', p: 0 }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={10}
                                    rowsPerPageOptions={[10, 25]}
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-columnHeaders': {
                                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                                            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' }
                                        },
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <StudentTables />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Redesigned PDF Template - Multi-Page Chunked View */}
            <Box
                ref={pdfRef}
                sx={{
                    position: 'absolute',
                    top: '-10000px',
                    left: '-10000px',
                    width: '794px', // Standard A4 width in pixels at 96 DPI after scaling could vary, but consistent width is key
                    bgcolor: '#ffffff',
                    display: 'none',
                    zIndex: -1
                }}
            >
                {stats.chunks.map((chunk, chunkIndex) => (
                    <Box
                        key={chunkIndex}
                        className="pdf-page-chunk"
                        sx={{
                            width: '794px',
                            minHeight: '1122px', // Standard A4 height in pixels
                            p: '35px',
                            boxSizing: 'border-box',
                            bgcolor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            pageBreakAfter: 'always'
                        }}
                    >
                        {/* College Logo */}
                        <Box sx={{ width: '100%', mb: 1 }}>
                            <img src={aecLogo} alt="AEC Logo" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </Box>

                        <Box sx={{ pb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                                Branch: {data?.metadata?.branch || 'N/A'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Course/Sem: {data?.metadata?.courseSem || 'N/A'}
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Held in: {data?.metadata?.heldIn || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ borderBottom: '2px solid', display: 'inline-block', px: 4, pb: 0.5 }}>
                                {subject} - Report
                            </Typography>
                        </Box>

                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 0, maxWidth: '550px', mx: 'auto' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ bgcolor: '#1a73e8', color: 'white', fontWeight: 'bold', width: '50px', py: 0.8, fontSize: '0.8rem', textAlign: 'center' }}>S.No</TableCell>
                                        <TableCell sx={{ bgcolor: '#1a73e8', color: 'white', fontWeight: 'bold', width: '160px', py: 0.8, fontSize: '0.8rem', textAlign: 'center' }}>Regd. No</TableCell>
                                        <TableCell sx={{ bgcolor: '#1a73e8', color: 'white', fontWeight: 'bold', width: '80px', py: 0.8, fontSize: '0.8rem', textAlign: 'center' }}>Grade</TableCell>
                                        <TableCell sx={{ bgcolor: '#1a73e8', color: 'white', fontWeight: 'bold', width: '90px', py: 0.8, fontSize: '0.8rem', textAlign: 'center' }}>Result</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {chunk.map((student, index) => (
                                        <TableRow key={student.regdNo} sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                                            <TableCell sx={{ borderRight: '1px solid #e0e0e0', py: 0.8, fontSize: '0.75rem', textAlign: 'center' }}>
                                                {chunkIndex * 20 + index + 1}
                                            </TableCell>
                                            <TableCell sx={{ borderRight: '1px solid #e0e0e0', py: 0.8, fontSize: '0.75rem', fontWeight: 500, textAlign: 'center' }}>
                                                {student.regdNo}
                                            </TableCell>
                                            <TableCell sx={{
                                                borderRight: '1px solid #e0e0e0',
                                                fontWeight: 'bold',
                                                py: 0.8,
                                                fontSize: '0.75rem',
                                                textAlign: 'center',
                                                color: student.result === 'Passed' ? '#2e7d32' : '#d32f2f'
                                            }}>
                                                {student.grade}
                                            </TableCell>
                                            <TableCell sx={{
                                                fontWeight: 'bold',
                                                py: 0.8,
                                                fontSize: '0.75rem',
                                                textAlign: 'center',
                                                color: student.result === 'Passed' ? '#2e7d32' : '#d32f2f'
                                            }}>
                                                {student.result}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Signatures - Only on the last page */}
                        {chunkIndex === stats.chunks.length - 1 && (
                            <Box sx={{ mt: 10, display: 'flex', justifyContent: 'space-between', px: 4 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    ExamCell-Incharge
                                </Typography>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Head Of The Department (HOD)
                                </Typography>
                            </Box>
                        )}

                        {/* Page Number footer */}
                        <Box sx={{ mt: 'auto', textAlign: 'right', pt: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Page {chunkIndex + 1} of {stats.chunks.length}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default SubjectDetail;
