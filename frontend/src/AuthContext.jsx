import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('t-sheet-token'));
    const [loading, setLoading] = useState(true);

    // Set axios default auth header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Verify token on mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('/api/me');
                setUser(response.data);
            } catch (err) {
                // Token invalid or expired
                localStorage.removeItem('t-sheet-token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const login = async (username, password) => {
        const response = await axios.post('/api/login', { username, password });
        const { token: newToken, ...userData } = response.data;
        localStorage.setItem('t-sheet-token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('t-sheet-token');
        setToken(null);
        setUser(null);
    };

    const canUpload = user && user.role !== 'viewer';

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, canUpload }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
