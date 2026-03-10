import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    Stack,
    InputAdornment,
    IconButton,
    Chip,
} from '@mui/material';
import {
    AutoGraph as AutoGraphIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Login as LoginIcon,
} from '@mui/icons-material';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #4f46e5 100%)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Decorative circles */}
            <Box sx={{
                position: 'absolute',
                top: -120,
                right: -120,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.15)',
                filter: 'blur(60px)',
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -100,
                left: -100,
                width: 350,
                height: 350,
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.1)',
                filter: 'blur(50px)',
            }} />
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '15%',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'rgba(225, 29, 72, 0.08)',
                filter: 'blur(40px)',
            }} />

            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    mx: 2,
                    p: 5,
                    borderRadius: 5,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Header */}
                <Stack alignItems="center" sx={{ mb: 4 }}>
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
                        mb: 2,
                    }}>
                        <AutoGraphIcon sx={{ color: '#fff', fontSize: 30 }} />
                    </Box>

                    <Typography variant="h5" fontWeight="800" color="text.primary">
                        T-Sheet Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Sign in to access the dashboard
                    </Typography>
                </Stack>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        {error && (
                            <Alert
                                severity="error"
                                sx={{ borderRadius: 3, fontSize: '0.85rem' }}
                                onClose={() => setError('')}
                            >
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4f46e5',
                                    }
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                        >
                                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#4f46e5',
                                    }
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                            sx={{
                                py: 1.5,
                                borderRadius: 3,
                                fontSize: '0.95rem',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                                    boxShadow: '0 6px 24px rgba(79, 70, 229, 0.4)',
                                },
                                '&.Mui-disabled': {
                                    background: 'rgba(79, 70, 229, 0.5)',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                }
                            }}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
};

export default LoginPage;
