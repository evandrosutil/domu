import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import ExpenseForm from './ExpenseForm';
import Dashboard from './Dashboard';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/`;
      const response = await axios.get(apiUrl);
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

  const handleDeleteExpense = async (expense) => {
    const expenseId = expense.id
    if (window.confirm(`Tem certeza que deseja excluir a despesa ${expense.description}? Esta ação não pode ser desfeita.`)) {
      console.log(`Tentando excluir despesa ID: ${expenseId}`);
      try {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/${expenseId}/`;
        console.log(`Chamando DELETE para: ${apiUrl}`);

        const response = await axios.delete(apiUrl);

        if (response.status === 204) {
          console.log(`Despesa ${expenseId} excluída com sucesso da API.`);
          setExpenses(prevExpenses => prevExpenses.filter(exp => exp.id !== expenseId));
          setError(null);
        } else {
           console.warn(`API retornou status ${response.status} para exclusão da despesa ${expenseId}`);
           setError(`Recebido status inesperado ${response.status} ao excluir.`);
        }
       } catch (err) {
          console.error(`Erro ao excluir despesa ${expenseId}:`, err.response || err.message || err);
          const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : `Falha ao excluir despesa ${expenseId}. Verifique o console.`;
          setError(errorMsg);
        }
      } else {
         console.log(`Exclusão da despesa ${expenseId} cancelada pelo usuário.`);
      }
    };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense); 
    setIsEditModalOpen(true);
    console.log("Editando despesa:", expense);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingExpense(null);
  };

  const handleUpdateExpense = (updatedExpense) => {
    console.log("App.js recebeu despesa atualizada:", updatedExpense);
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === updatedExpense.id
          ? updatedExpense
          : expense
      )
    );
    handleCloseEditModal();

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
                <button 
                  onClick={() => handleOpenEditModal(expense)}
                  style={{ marginLeft: '10px', cursor: 'pointer', color: 'green', border:'1px solid green', borderRadius:'3px', background: 'transparent' }}
                  title={`Editar despesa ID ${expense.id}`}
                >
                    Editar
                </button>

                <button
                  onClick={() => handleDeleteExpense(expense)}
                  style={{ marginLeft: '10px', cursor: 'pointer', color: 'red', border:'1px solid red', borderRadius:'3px', background: 'transparent' }}
                  title={`Excluir despesa ID ${expense.id}`}
                >
                Excluir
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma despesa registrada ainda.</p>
        )}
        <h2>Resumo de despesas</h2>
        <Dashboard />

        {isEditModalOpen && (
            <div className="modal-overlay"
              style={{ 
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 99,
              display: 'flex', alignItem: 'center', justifyContent: 'center'
            }} onClick={handleCloseEditModal}>

              <div className="modal-content"
                style={{
                background: 'white', padding: '20px 30px', borderRadius: '8px', zIndex: 100,
                minWidth: '300px', maxWidth: '90%',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }} onClick={(e) => e.stopPropagation()}>

                <h2>Editar Despesa</h2>
                <ExpenseForm
                  initialData={editingExpense}
                  onExpenseUpdated={handleUpdateExpense}
                />
                <button onClick={handleCloseEditModal} style={{ marginTop: '10px', marginRight: '10px' }}>
                  Cancelar
                </button>
              </div>
            </div>
        )}

      </header>
    </div>
  );
}

export default App;
