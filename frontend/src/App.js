import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

import HomePage from './HomePage';
import ExpenseListPage from './ExpenseListPage';
import DashboardPage from './DashboardPage';
import CategoryManagementPage from './CategoryManagementPage';

function App() {

  return (
    <div className="App">
      <nav style={{ padding: '10px 20px', background: '#f0f0f0', marginBottom: '20px', textAlign: 'left' }}>
        <Link to="/" style={{ marginRight: '15px', textDecoration: 'none' }}>Home</Link>
        <Link to="/expenses" style={{ marginRight: '15px', textDecoration: 'none' }}>Despesas</Link>
        <Link to="/categories" sytle={{ marginRight: '15px', textDecoration: 'none' }}>Categorias</Link>
        <Link to="/dashboard" style={{ marginRight: '15px', textDecoration: 'none' }}>Dashboard</Link>
      </nav>

      <header className="App-header">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/expenses" element={<ExpenseListPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoryManagementPage />} />

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
