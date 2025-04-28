import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const fetchCategories = useCallback(async () => {
     setLoading(true); setError(null); try { const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/`; const response = await axios.get(apiUrl); setCategories(response.data.results || response.data || []); } catch (err) { console.error("Erro ao buscar categorias:", err); setError("Falha ao carregar categorias. Verifique a API ou tente novamente."); setCategories([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategorySubmit = async (event) => {
    event.preventDefault(); // Impede recarregamento da página
    setAddError(null); // Limpa erros anteriores de adição

    if (!newCategoryName.trim()) {
      setAddError("O nome da categoria não pode estar vazio.");
      return;
    }

    setAddLoading(true);

    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/`;
      const response = await axios.post(apiUrl, { name: newCategoryName });

      setCategories(prevCategories => [response.data, ...prevCategories]);
      setNewCategoryName('');

    } catch (err) {
      console.error("Erro ao adicionar categoria:", err.response || err);
      let errorMsg = "Falha ao adicionar categoria.";
      if (err.response?.data && typeof err.response.data === 'object') {
          try {
              errorMsg = Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
          } catch (e) { errorMsg = JSON.stringify(err.response.data); }
      } else if (err.response?.data) { errorMsg = err.response.data; }
      setAddError(errorMsg);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}" (ID: ${categoryId})? \n\nAVISO: Despesas que usam esta categoria ficarão sem categoria (SET NULL).`)) {

    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/${categoryId}/`;
      console.log(`Chamando DELETE para: ${apiUrl}`); // Log para debug

      const response = await axios.delete(apiUrl);

      if (response.status === 204) {
        console.log(`Categoria ${categoryId} excluída com sucesso.`); // Log
        setCategories(prevCategories =>
          prevCategories.filter(cat => cat.id !== categoryId)
        );
      } else {
        console.warn(`API retornou status ${response.status} para exclusão da categoria ${categoryId}`);
        setError(`Recebido status inesperado ${response.status} ao excluir categoria.`);
      }

    } catch (err) {
      console.error(`Erro ao excluir categoria ${categoryId}:`, err.response || err);
      let errorMsg = `Falha ao excluir categoria "${categoryName}".`;
      if (err.response?.data && typeof err.response.data === 'object') {
          try {
              errorMsg += ' Detalhes: ' + Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
          } catch (e) { errorMsg += ' Detalhes: ' + JSON.stringify(err.response.data); }
      } else if (err.response?.data) { errorMsg += ' Detalhes: ' + err.response.data; }
      setError(errorMsg);
    } finally {
    }
  } else {
    console.log(`Exclusão da categoria ${categoryId} cancelada.`); // Log
  }
};


  return (
    <div style={{ width: '90%', maxWidth: '700px', margin: 'auto', textAlign: 'left' }}>
      <h2>Gerenciar Categorias</h2>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
         <h4>Adicionar Nova Categoria</h4>
         <form onSubmit={handleAddCategorySubmit}>
           <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
             <div style={{ flexGrow: 1 }}>
               <label htmlFor="newCategoryName" style={{ display:'block', marginBottom:'3px', fontWeight:'bold' }}>Nome:</label>
               <input
                 type="text"
                 id="newCategoryName"
                 value={newCategoryName}
                 onChange={(e) => setNewCategoryName(e.target.value)}
                 placeholder="Ex: Limpeza, Jardinagem"
                 style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                 disabled={addLoading}
               />
               {addError && <p style={{ color: 'red', fontSize: 'small', marginTop: '5px', marginBottom: '0' }}>Erro: {addError}</p>}
             </div>
             <button type="submit" disabled={addLoading} style={{ padding: '8px 15px', marginTop: '22px' }}>
               {addLoading ? 'Adicionando...' : 'Adicionar'}
             </button>
           </div>
         </form>
      </div>


      <h3>Categorias Existentes</h3>
       {loading && <p>Carregando categorias...</p>}
       {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Erro: {error}</p>}
       {!loading && !error && categories.length > 0 ? (
         <ul style={{ listStyle: 'none', padding: 0 }}>
           {categories.map(category => (
             <li key={category.id} style={{ borderBottom: '1px solid #eee', padding: '8px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span>{category.name} (ID: {category.id})</span>
               <div>
                 <button disabled style={{ marginLeft: '10px', fontStyle: 'italic', cursor: 'not-allowed' }}>Editar</button>
                 <button 
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    style={{ marginLeft: '10px', cursor: 'pointer', color: 'red', border: '1px solid red', background: 'transparent', borderRadius: '3px' }}
                    title={`Excluir categoria ${category.name}`}
                >
                    Excluir
                </button>
               </div>
             </li>
           ))}
         </ul>
       ) : (
         !loading && !error && <p>Nenhuma categoria cadastrada.</p>
       )}
    </div>
  );
}

export default CategoryManagementPage;
