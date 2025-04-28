import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

import HomePage from './HomePage';
import ExpenseListPage from './ExpenseListPage';
import DashboardPage from './DashboardPage';
import CategoryManagementPage from './CategoryManagementPage';
import LoginPage from './LoginPage';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  }

  return (
    <div className="App">
      <nav style={{ 
          padding: '10px 20px', 
          background: '#f0f0f0', 
          marginBottom: '20px', 
          display: 'flex',
          justifyContext: 'space-between',
          alignItems: 'center'
      }}>
      <div>
        <Link to="/" style={{ marginRight: '15px', textDecoration: 'none' }}>Home</Link>

        {auth.isAuthenticated && (
          <>
            <Link to="/expenses" style={{ marginRight: '15px', textDecoration: 'none' }}>Despesas</Link>
            <Link to="/categories" sytle={{ marginRight: '15px', textDecoration: 'none' }}>Categorias</Link>
            <Link to="/dashboard" style={{ marginRight: '15px', textDecoration: 'none' }}>Dashboard</Link>
         </>
        )}
      </div>
      <div>
        {auth.isAuthenticated ? (
          <button
            onClick={handleLogout} style={{
                cursor: 'pointer',
                padding: '5px 10px'
            }}>
            Sair ({auth.user?.username || 'Usuário'})
        </button>
        ) : (
            <Link to="/login" style={{
                textDecoration: 'none' }}>Login</Link>
        )}
      </div>
      </nav>

      <header className="App-header">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/expenses" element={<ProtectedRoute><ExpenseListPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoryManagementPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="*" element={
            <main style={{ padding: "1rem" }}>
              <h2>404 - Página Não Encontrada!</h2>
              <p>O endereço que você tentou acessar não existe.</p>
              <Link to="/">Voltar para Home</Link>
            </main>
          } />
        </Routes>
      </header>

      <footer style={{marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #ccc'}}>
        Domu - você no controle do seu condomínio.
      </footer>
    </div>
  );
}

export default App;
