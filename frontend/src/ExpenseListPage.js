import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ExpenseForm from './ExpenseForm';
import './App.css';
// Importar CSS se houver estilos específicos, ou usar App.css global
// import './ExpenseListPage.css';

function ExpenseListPage() {
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
    // Poderia adicionar feedback visual aqui
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm(`Tem certeza que deseja excluir a despesa ID ${expenseId}? Esta ação não pode ser desfeita.`)) {
      try {
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/${expenseId}/`;
        const response = await axios.delete(apiUrl);

        if (response.status === 204) {
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
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingExpense(null);
  };

  const handleUpdateExpense = (updatedExpense) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    handleCloseEditModal();
  };

  return (
    <div>
      <h2>Despesas</h2>

      <ExpenseForm onExpenseAdded={handleExpenseAdded} />

      <hr style={{ margin: '20px 0' }} />

      <h3>Despesas Registradas</h3>

      {loading && <p>Carregando despesas...</p>}

      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}

      {!loading && !error && expenses.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {expenses.map(expense => (
            <li key={expense.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div> {/* Div para agrupar texto */}
                <strong>{expense.description}</strong> - R$ {parseFloat(expense.amount).toFixed(2)} - {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </div>
              <div>
                <button
                  onClick={() => handleOpenEditModal(expense)}
                  style={{ marginLeft: '10px', cursor: 'pointer', color: 'green', border:'1px solid green', borderRadius:'3px', background: 'transparent' }}
                  title={`Editar despesa ID ${expense.id}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteExpense(expense.id)}
                  style={{ marginLeft: '10px', cursor: 'pointer', color: 'red', border:'1px solid red', borderRadius:'3px', background: 'transparent' }}
                  title={`Excluir despesa ID ${expense.id}`}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading && !error && <p>Nenhuma despesa registrada ainda.</p> // Mensagem se vazio
      )}

      {isEditModalOpen && editingExpense && (
         <div className="modal-overlay" onClick={handleCloseEditModal}>
           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
    </div>
  );
}

export default ExpenseListPage;
