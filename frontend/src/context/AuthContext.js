import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null); 

    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
            // console.log("AuthContext: Token encontrado, usuário autenticado.");
            // Aqui você poderia fazer uma chamada à API para buscar detalhes do usuário
            // associado a este token e popular o state 'user'
            // Ex: fetchUserDetails(token);
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [token]);

    const login = async (username, password) => {
        setAuthLoading(true);
        setAuthError(null);
        try {
            const loginUrl = `${process.env.REACT_APP_API_BASE_URL}/token-auth/`;
            console.log(`AuthContext: Tentando login em ${loginUrl}`);

            const response = await axios.post(loginUrl, { username, password });

            if (response.data.token) {
                const receivedToken = response.data.token;
                localStorage.setItem('authToken', receivedToken);
                setToken(receivedToken);
                setIsAuthenticated(true);
                console.log("AuthContext: Login bem-sucedido.");
                return true; 
            } else {
                throw new Error("Resposta da API de login inválida: token não encontrado.");
            }
        } catch (err) {
            console.error("AuthContext: Falha no login:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.non_field_errors?.[0] || "Usuário ou senha inválidos.";
            setAuthError(errorMsg);
            localStorage.removeItem('authToken');
            setToken(null);
            setIsAuthenticated(false);
            setUser(null);
            return false;
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = () => {
        setAuthLoading(true);
        console.log("AuthContext: Fazendo logout.");
        localStorage.removeItem('authToken');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setAuthError(null);
        setAuthLoading(false);
    };

    const value = {
        token,
        user,
        isAuthenticated,
        authLoading,
        authError,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
