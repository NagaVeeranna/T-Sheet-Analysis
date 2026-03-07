import React, { useState } from 'react';
import { Box, Typography, Paper, useTheme, LinearProgress } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import axios from 'axios';

const UploadZone = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const theme = useTheme();

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

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    return (
        <Box sx={{ py: 8 }}>
            {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

            {error && (
                <Paper sx={{ p: 2, mb: 4, bgcolor: 'error.main', color: 'white' }}>
                    <Typography>{error}</Typography>
                </Paper>
            )}

            <label htmlFor="upload-button-main">
                <input
                    accept="application/pdf"
                    id="upload-button-main"
                    type="file"
                    hidden
                    onChange={handleFileUpload}
                />
                <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                        height: '50vh',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 3,
                        border: isDragging ? `2px dashed ${theme.palette.primary.main}` : '2px dashed rgba(0, 0, 0, 0.1)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        bgcolor: isDragging ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.02)',
                            borderColor: 'rgba(0, 0, 0, 0.2)'
                        }
                    }}
                >
                    <UploadIcon sx={{ fontSize: 100, color: isDragging ? 'primary.main' : 'rgba(0, 0, 0, 0.1)' }} />
                    <Typography variant="h5" color={isDragging ? 'primary.main' : 'textSecondary'}>
                        {isDragging ? 'Drop to upload' : 'Upload a T-Sheet PDF to get started'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
                        Drag and drop your PDF here, or click to browse. We'll automatically extract grades, SGPA, and student IDs.
                    </Typography>
                </Box>
            </label>
        </Box>
    );
};

export default UploadZone;
