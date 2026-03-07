import React, { useMemo, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    useTheme,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Analytics = ({ data }) => {
    const theme = useTheme();
    const analyticsRef = useRef(null);

    const handleDownloadPDF = async () => {
        const element = analyticsRef.current;
        if (!element) return;

        // Add some padding for the PDF
        const originalStyle = element.style.padding;
        element.style.padding = '20px';

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        element.style.padding = originalStyle;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // If the content is taller than A4, we might need multiple pages, 
        // but for now let's fit it to one page or scale accordingly.
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Semester_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const pieData = useMemo(() => {
        if (!data) return [];
        const passed = data.results.filter(s => {
            const hasF = Object.values(s.grades).some(g => g === 'F' || g === 'AB');
            return !hasF && s.sgpa && parseFloat(s.sgpa) > 0;
        }).length;
        const failed = data.results.length - passed;
        return [
            { name: 'Passed', value: passed, color: '#10b981' },
            { name: 'Failed', value: failed, color: '#ef4444' }
        ];
    }, [data]);

    const subjectPerformance = useMemo(() => {
        if (!data) return [];

        // Define grade weights
        const weights = { 'A+': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0, 'AB': 0 };

        return data.subjects.map(sub => {
            let totalPoints = 0;
            let count = 0;
            data.results.forEach(s => {
                const g = s.grades[sub];
                if (g && weights[g] !== undefined) {
                    totalPoints += weights[g];
                    count++;
                }
            });
            return {
                name: sub,
                avgPoints: count > 0 ? (totalPoints / count).toFixed(2) : 0
            };
        });
    }, [data]);

    const subjectPassFailData = useMemo(() => {
        if (!data) return [];

        return data.subjects.map(sub => {
            let passedRolls = [];
            let failedRolls = [];
            data.results.forEach(s => {
                const g = s.grades[sub];
                if (g) {
                    const rollWithGrade = `${s.regdNo}(${g})`;
                    if (g === 'F' || g === 'AB') failedRolls.push(rollWithGrade);
                    else passedRolls.push(rollWithGrade);
                }
            });
            const total = passedRolls.length + failedRolls.length;
            return {
                name: sub,
                passed: passedRolls.length,
                failed: failedRolls.length,
                passedRolls,
                failedRolls,
                total,
                passPercentage: total > 0 ? ((passedRolls.length / total) * 100).toFixed(2) : 0
            };
        });
    }, [data]);

    if (!data) return <Typography>Please upload a T-Sheet first.</Typography>;

    return (
        <Box sx={{ pb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Semester Analytics</Typography>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Download PDF
                </Button>
            </Stack>

            <Box ref={analyticsRef} sx={{ bgcolor: 'background.default' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: 4, height: 500, display: 'flex', flexDirection: 'column', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">Overall Pass/Fail Distribution</Typography>
                            <Box sx={{ flexGrow: 1, position: 'relative', width: '100%', height: '100%' }}>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={130}
                                            outerRadius={160}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{ paddingTop: 10 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Centered Pass Percentage */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: '45%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <Typography variant="h2" fontWeight="800" color="success.main" sx={{ lineHeight: 1 }}>
                                        {((pieData.find(d => d.name === 'Passed')?.value || 0) / (pieData.reduce((acc, d) => acc + d.value, 0) || 1) * 100).toFixed(0)}%
                                    </Typography>
                                    <Typography variant="button" color="text.secondary" fontWeight="700" sx={{ mt: 1, letterSpacing: 2 }}>
                                        SUCCESS RATE
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: 4, height: 600, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">Subject-wise Performance (Avg. Points)</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Comparison of average grade points across all subjects (Scale: 0-10)</Typography>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={subjectPerformance} layout="vertical" margin={{ left: 50, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis type="number" domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="avgPoints" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} barSize={25}>
                                        {subjectPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={parseFloat(entry.avgPoints) < 5 ? '#ef4444' : theme.palette.primary.main} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">Subject Wise Analysis</Typography>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Subject Name</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'success.main' }}>Passed</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'error.main' }}>Failed</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Pass %</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Failed Students (Grade)</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Passed Students (Grade)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {subjectPassFailData.map((row) => (
                                            <TableRow key={row.name} hover>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>{row.name}</TableCell>
                                                <TableCell align="center">{row.total}</TableCell>
                                                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>{row.passed}</TableCell>
                                                <TableCell align="center" sx={{ color: 'error.main', fontWeight: 'bold' }}>{row.failed}</TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        bgcolor: parseFloat(row.passPercentage) > 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: parseFloat(row.passPercentage) > 80 ? '#059669' : '#dc2626',
                                                        display: 'inline-block',
                                                        fontWeight: 'bold',
                                                        minWidth: 60
                                                    }}>
                                                        {row.passPercentage}%
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', maxWidth: 200, color: 'error.main' }}>
                                                    {row.failedRolls.length > 0 ? row.failedRolls.join(', ') : 'None'}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.7rem', maxWidth: 300, color: 'text.secondary' }}>
                                                    {row.passedRolls.join(', ')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Analytics;
