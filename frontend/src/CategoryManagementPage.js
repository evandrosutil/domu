import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Heading, FormControl, FormLabel, Input, Button, HStack,
  Table, Thead, Tbody, Tr, Th, Td, IconButton, useToast, Text,
  Alert, AlertIcon, AlertDescription, Spinner, Center,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  const toast = useToast();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();

  const fetchCategories = useCallback(async () => { setLoading(true); setError(null); try { const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/`; const response = await axios.get(apiUrl); setCategories(response.data.results || response.data || []); } catch (err) { console.error("Erro ao buscar categorias:", err); setError("Falha ao carregar categorias."); setCategories([]); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleAddCategorySubmit = async (event) => {
    event.preventDefault();
    setAddError(null);
    if (!newCategoryName.trim()) { setAddError("O nome da categoria não pode estar vazio."); return; }
    setAddLoading(true);
    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/`;
      const response = await axios.post(apiUrl, { name: newCategoryName });
      setCategories(prevCategories => [response.data, ...prevCategories]);
      setNewCategoryName('');

      toast({ title: "Categoria adicionada!", description: `"${response.data.name}" foi criada.`, status: "success", duration: 3000, isClosable: true, position: "top-right" });
    } catch (err) {
       console.error("Erro ao adicionar categoria:", err.response || err); let errorMsg = "Falha ao adicionar categoria."; if (err.response?.data && typeof err.response.data === 'object') { try { errorMsg = Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; '); } catch (e) { errorMsg = JSON.stringify(err.response.data); } } else if (err.response?.data) { errorMsg = err.response.data; } setAddError(errorMsg);
       toast({ title: "Erro ao adicionar", description: errorMsg, status: "error", duration: 5000, isClosable: true, position: "top-right" });
    } finally { setAddLoading(false); }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}" (ID: ${categoryId})?`)) {
      // Adicionar um try/catch real aqui seria ideal
      try {
          const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/${categoryId}/`;
          await axios.delete(apiUrl);
          setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));
          toast({ title: "Categoria excluída!", description: `"${categoryName}" foi removida.`, status: "warning", duration: 3000, isClosable: true, position: "top-right" });
      } catch(err) {
          console.error(`Erro ao excluir categoria ${categoryId}:`, err.response || err); let errorMsg = `Falha ao excluir categoria "${categoryName}".`; if (err.response?.data && typeof err.response.data === 'object') { try { errorMsg += ' Detalhes: ' + Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; '); } catch (e) { errorMsg += ' Detalhes: ' + JSON.stringify(err.response.data); } } else if (err.response?.data) { errorMsg += ' Detalhes: ' + err.response.data; } setError(errorMsg); // Erro geral da página
          toast({ title: "Erro ao excluir", description: errorMsg, status: "error", duration: 5000, isClosable: true, position: "top-right" });
      }
    }
  };

  const handleOpenCategoryEditModal = (category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
    setEditError(null);
    onEditModalOpen();
  };

  const handleModalClose = () => {
      onEditModalClose();
      setEditingCategory(null);
      setEditedCategoryName('');
      setEditError(null);
  }

  const handleUpdateCategorySubmit = async (event) => {
    event.preventDefault();
    setEditError(null);
    if (!editedCategoryName.trim()) { setEditError("O nome da categoria não pode estar vazio."); return; }
    if (editingCategory && editedCategoryName === editingCategory.name) { handleModalClose(); return; }
    setEditLoading(true);
    try {
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/categories/${editingCategory.id}/`;
      const response = await axios.put(apiUrl, { name: editedCategoryName });
      setCategories(prevCategories => prevCategories.map(cat => cat.id === editingCategory.id ? response.data : cat ));
      toast({ title: "Categoria atualizada!", status: "success", duration: 3000, isClosable: true, position: "top-right" });
      handleModalClose();
    } catch (err) {
      console.error(`Erro ao atualizar categoria ${editingCategory?.id}:`, err.response || err); let errorMsg = `Falha ao atualizar categoria "${editingCategory?.name}".`; if (err.response?.data && typeof err.response.data === 'object') { try { errorMsg += ' Detalhes: ' + Object.entries(err.response.data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; '); } catch (e) { errorMsg += ' Detalhes: ' + JSON.stringify(err.response.data); } } else if (err.response?.data) { errorMsg += ' Detalhes: ' + err.response.data; } setEditError(errorMsg);
       // Poderia usar toast de erro aqui também
    } finally { setEditLoading(false); }
  };

  return (
    <Box p={{ base: 4, md: 6 }} maxW="800px" mx="auto">
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Gerenciar Categorias
      </Heading>

      <Box p={5} borderWidth={1} borderRadius="lg" boxShadow="sm" mb={8} bg="white">
        <Heading as="h4" size="md" mb={4}>Adicionar Nova Categoria</Heading>
        <form onSubmit={handleAddCategorySubmit}>
          <FormControl isInvalid={!!addError}>
             <HStack spacing={3}>
                <Input
                    id="newCategoryName"
                    placeholder="Nome da nova categoria"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    isDisabled={addLoading} // Desabilita durante o envio
                    focusBorderColor="teal.500" // Cor da borda no foco
                    flexGrow={1} // Ocupa o espaço horizontal restante
                />
                <Button
                    type="submit"
                    colorScheme="teal"
                    isLoading={addLoading}
                    loadingText="Adicionando"
                >
                    Adicionar
                </Button>
             </HStack>
             {addError && (
                <Alert status="error" borderRadius="md" fontSize="sm" mt={3}> {/* mt = margin-top */}
                  <AlertIcon />
                  <AlertDescription>{addError}</AlertDescription>
                </Alert>
             )}
          </FormControl>
        </form>
      </Box>

      <Heading as="h3" size="md" mb={4}>Categorias Existentes</Heading>
      {loading && <Center py={10}><Spinner color="teal.500" size="xl" /></Center>}
      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && categories.length > 0 ? (
        <Box borderWidth={1} borderRadius="lg" boxShadow="sm" bg="white" overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th>Nome</Th>
                <Th isNumeric>ID</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map(category => (
                <Tr key={category.id} _hover={{ bg: "gray.50" }}>
                  <Td>{category.name}</Td>
                  <Td isNumeric>{category.id}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label={`Editar categoria ${category.name}`}
                        icon={<EditIcon />}
                        colorScheme="yellow"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCategoryEditModal(category)}
                      />
                      <IconButton
                        aria-label={`Excluir categoria ${category.name}`}
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        !loading && !error && <Text color="gray.500" mt={4}>Nenhuma categoria cadastrada.</Text>
      )}

      <Modal isOpen={isEditModalOpen} onClose={handleModalClose} isCentered>
        <ModalOverlay /> 
        <ModalContent as="form" onSubmit={handleUpdateCategorySubmit}>
          <ModalHeader>Editar Categoria (ID: {editingCategory?.id})</ModalHeader>
          <ModalCloseButton /> 
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!editError}>
              <FormLabel htmlFor="editedCategoryName-modal">Nome da Categoria:</FormLabel>
              <Input
                id="editedCategoryName-modal"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
                placeholder="Novo nome"
                isDisabled={editLoading}
                focusBorderColor="teal.500"
              />
              {editError && (
                <Alert status="error" borderRadius="md" fontSize="sm" mt={3}>
                  <AlertIcon />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter> 
            <Button onClick={handleModalClose} mr={3} variant="ghost" isDisabled={editLoading}>Cancelar</Button>
            <Button
              colorScheme="teal"
              type="submit"
              isLoading={editLoading}
              loadingText="Salvando"
            >
              Salvar Alterações
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box> 
  );
}

export default CategoryManagementPage;
