import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const auth = useAuth(); 

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/expenses";

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(from, { replace: true }); 
    }
  }, [auth.isAuthenticated, navigate, from]);


  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    const success = await auth.login(username, password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h2>Login - Domu</h2>
      <form onSubmit={handleLoginSubmit}>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label htmlFor="login-username" style={{ display: 'block', marginBottom: '5px' }}>Usuário:</label>
          <input
            type="text"
            id="login-username" // ID único
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: 'calc(100% - 18px)', padding: '8px' }} 
          />
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label htmlFor="login-password" style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: 'calc(100% - 18px)', padding: '8px' }}
          />
        </div>

        {auth.authError && <p style={{ color: 'red', marginBottom: '15px' }}>{auth.authError}</p>}

        <button
          type="submit"
          disabled={auth.authLoading} // Desabilita botão durante o login
          style={{ padding: '10px 25px', cursor: 'pointer', width: '100%', fontSize: '1rem' }}
        >
          {auth.authLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p style={{marginTop: '20px', fontSize: 'small', color: '#0000ff'}}>
         <Link to="/">Voltar para Home</Link>
      </p>
    </div>
  );
}

export default LoginPage;
