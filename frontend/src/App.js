import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import ExpenseForm from './ExpenseForm';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/expenses/');
      setExpenses(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar despesas:", err);
      setError("Falha ao carregar despesas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleExpenseAdded = (newExpense) => {
     setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  };

  if (loading && expenses.length === 0) { // Só mostra loading inicial
    return <div className="App"><h1>Carregando despesas...</h1></div>;
  }

  if (error) {
    return <div className="App"><h1>Erro</h1><p>{error}</p></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gestão de Despesas Domu</h1>

        <ExpenseForm onExpenseAdded={handleExpenseAdded} />

        <h2>Despesas Registradas</h2>
        {expenses.length > 0 ? (
          <ul>
            {expenses.map(expense => (
              <li key={expense.id}>
                <strong>{expense.description}</strong> - R$ {parseFloat(expense.amount).toFixed(2)} - {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma despesa registrada ainda.</p>
        )}
      </header>
    </div>
  );
}

export default App;
