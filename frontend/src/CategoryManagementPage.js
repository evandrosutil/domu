import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const [isCategoryEditModalOpen, setIsCategoryEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const fetchCategories = useCallback(async () => {
      setLoading(true); setError(null); 
      try { 
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/`; 
        const response = await axios.get(apiUrl); 
        setCategories(response.data.results || response.data || []); 
      } catch (err) { 
        console.error("Erro ao buscar categorias:", err); 
        setError("Falha ao carregar categorias. Verifique a API ou tente novamente."); 
        setCategories([]); 
      } finally { 
        setLoading(false); 
      }}, []
  );
  useEffect(() => { 
    fetchCategories(); 
  }, [fetchCategories]);

  const handleAddCategorySubmit = async (event) => {
    event.preventDefault(); 
    setAddError(null); 
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
          errorMsg = Object.entries(err.response.data).map(
              ([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; '); 
        } catch (e) { 
          errorMsg = JSON.stringify(err.response.data); 
        }} else if (err.response?.data) { 
          errorMsg = err.response.data; 
        } 

        setAddError(errorMsg); 
    } finally { 
        setAddLoading(false); 
    }};
    
  const handleDeleteCategory = async (categoryId, categoryName) => {
      if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}" (ID: ${categoryId})? \n\nAVISO: Despesas que usam esta categoria ficarão sem categoria (SET NULL).`)) { 
        try { 
          const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/${categoryId}/`; 
          const response = await axios.delete(apiUrl); 
          if (response.status === 204) { 
            setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId)); 
            setError(null); 
          } else {
            console.warn(`API retornou status ${response.status} para exclusão da categoria ${categoryId}`); 
            setError(`Recebido status inesperado ${response.status} ao excluir categoria.`); 
          }
        } catch (err) { 
          console.error(`Erro ao excluir categoria ${categoryId}:`, err.response || err); 
          let errorMsg = `Falha ao excluir categoria "${categoryName}".`; 
          if (err.response?.data && typeof err.response.data === 'object') {
            try { 
              errorMsg += ' Detalhes: ' + Object.entries(err.response.data).map(
                  ([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; '); 
            } catch (e) { 
              errorMsg += ' Detalhes: ' + JSON.stringify(err.response.data); 
            }} else if (err.response?.data) { 
              errorMsg += ' Detalhes: ' + err.response.data; 
            } 
            setError(errorMsg); 
        } 
      } 
  };

  const handleOpenCategoryEditModal = (category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setIsCategoryEditModalOpen(true);
    setEditError(null);
  };

  const handleCloseCategoryEditModal = () => {
    setIsCategoryEditModalOpen(false);
    setEditingCategory(null);
    setEditedCategoryName('');
    setEditError(null);
  };

  const handleUpdateCategorySubmit = async (event) => {
    event.preventDefault();
    setEditError(null);

    if (!editedCategoryName.trim()) {
      setEditError("O nome da categoria não pode estar vazio.");
      return;
    }
    
    if (editingCategory && editedCategoryName === editingCategory.name) {
      handleCloseCategoryEditModal();
      return;
    }

    setEditLoading(true);

    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/${editingCategory.id}/`;
     
      const response = await axios.put(apiUrl, { name: editedCategoryName });

    
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.id === editingCategory.id ? response.data : cat 
        )
      );
      handleCloseCategoryEditModal();

    } catch (err) {
      console.error(`Erro ao atualizar categoria ${editingCategory?.id}:`, err.response || err);
      let errorMsg = `Falha ao atualizar categoria "${editingCategory?.name}".`;
       // Tenta pegar erros de validação (ex: nome duplicado)
      if (err.response?.data && typeof err.response.data === 'object') {
          try {
              errorMsg += ' Detalhes: ' + Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
          } catch (e) { errorMsg += ' Detalhes: ' + JSON.stringify(err.response.data); }
      } else if (err.response?.data) { errorMsg += ' Detalhes: ' + err.response.data; }
      setEditError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };


  return (
    <div style={{ width: '90%', maxWidth: '700px', margin: 'auto', textAlign: 'left' }}>
<div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '5px'  }}>
   <h4>Adicionar Nova Categoria</h4>
   <form onSubmit={handleAddCategorySubmit}>
     <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
       {/* Div para agrupar label, input e erro */}
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
       <button type="submit" disabled={addLoading} style={{ padding: '8px 15px', marginTop: '30px' }}>
         {addLoading ? 'Adicionando...' : 'Adicionar'}
       </button>
     </div>
   </form>
</div>
{/* --- FIM Formulário de Adição --- */}
      <h2>Gerenciar Categorias</h2>

      <h3>Categorias Existentes</h3>

      {!loading && !error && categories.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.map(category => (
            <li key={category.id} style={{ /* estilos */ }}>
              <span>{category.name} (ID: {category.id})</span>
              <div>
                <button
                  onClick={() => handleOpenCategoryEditModal(category)}
                  style={{ marginLeft: '10px', cursor: 'pointer', color: 'green', border: '1px solid green', background: 'transparent', borderRadius: '3px' }}
                  title={`Editar categoria ${category.name}`}
                >
                  Editar
                </button>
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
      ) : ( `Nenhuma categoria encontrada` )}


      {isCategoryEditModalOpen && editingCategory && (
          <div className="modal-overlay" onClick={handleCloseCategoryEditModal}>
            <div className="modal-content" style={{minWidth: '300px', maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
               <h2>Editar Categoria (ID: {editingCategory.id})</h2>
               <form onSubmit={handleUpdateCategorySubmit}>
                  {/* Input para editar o nome */}
                  <div style={{marginBottom: '15px'}}>
                      <label htmlFor="editedCategoryName" style={{ display:'block', marginBottom:'5px', fontWeight:'bold' }}>Nome da Categoria:</label>
                      <input
                          type="text"
                          id="editedCategoryName"
                          value={editedCategoryName}
                          onChange={(e) => setEditedCategoryName(e.target.value)}
                          required
                          style={{ width: '95%', padding: '8px', boxSizing: 'border-box', border:'1px solid #ccc', borderRadius:'4px' }}
                          disabled={editLoading}
                      />
                  </div>
                  {editError && <p style={{ color: 'red', fontSize: 'small', marginTop: '10px' }}>Erro: {editError}</p>}
                  <div style={{ marginTop: '20px', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                      <button type="button" onClick={handleCloseCategoryEditModal} disabled={editLoading} style={{ marginRight: '10px' }}>
                          Cancelar
                      </button>
                      <button type="submit" disabled={editLoading} style={{background: '#28a745', color:'white', borderColor:'#28a745'}}>
                          {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                  </div>
               </form>
            </div>
          </div>
      )}
    </div>
  );
}

export default CategoryManagementPage;
