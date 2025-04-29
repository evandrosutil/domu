import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Box, Heading, SimpleGrid, Center, Spinner, Alert, AlertIcon, AlertDescription, Text } from '@chakra-ui/react';

ChartJS.register( CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend );

function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => { setLoading(true); setError(null); try { const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/expenses/summary/`; const response = await axios.get(apiUrl); setSummaryData(response.data); } catch (err) { console.error("Erro ao buscar resumo:", err); setError("Falha ao carregar resumo de despesas."); setSummaryData(null); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const monthlyChartData = {
    labels: summaryData?.stacked_monthly_summary?.labels || [],
    datasets: summaryData?.stacked_monthly_summary?.datasets || [],
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Resumo Mensal por Categoria (Empilhado)', 
      },
      tooltip: { 
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || ''; 
            if (label) { label += ': '; }
            let value = context.parsed.y || 0; 
            label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { 
          callback: function(value) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
          }
        }
      }
    }
  };

  const categoryChartData = { labels: summaryData?.category_summary?.labels || [], datasets: [ { label: '# de Reais', data: summaryData?.category_summary?.totals || [], backgroundColor: [ 'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)','rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)','rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)' ], borderColor: [ 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(199, 199, 199, 1)','rgba(83, 102, 255, 1)' ], borderWidth: 1, }, ], };
  const categoryChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', }, title: { display: true, text: 'Distribuição Geral por Categoria', }, tooltip: { callbacks: { label: function(context) { let label = context.label || ''; let value = context.raw || 0; let formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value); return `${label}: ${formattedValue}`; } } } }, };

  return (
    <Box width="100%">
      <Heading as="h2" size="lg" mb={8} textAlign="center">
        Análise de Dados
      </Heading>

      {loading && <Center py={20}><Spinner color="teal.500" size="xl" thickness="4px" /></Center>}
      {error && ( <Center> <Alert status="error" borderRadius="md" maxW="600px"> <AlertIcon /> <AlertDescription>{error}</AlertDescription> </Alert> </Center> )}

      {!loading && !error && summaryData && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, md: 10 }}>

          <Box borderWidth={1} borderRadius="lg" boxShadow="base" p={4} bg="white">
            {summaryData.stacked_monthly_summary?.datasets?.length > 0 ? (
              <Box position="relative" h="400px">
                <Bar options={monthlyChartOptions} data={monthlyChartData} />
              </Box>
            ) : (
              <Center h="400px"><Text color="gray.500">Sem dados para resumo mensal.</Text></Center>
            )}
          </Box>

          <Box borderWidth={1} borderRadius="lg" boxShadow="base" p={4} bg="white">
             {summaryData.category_summary?.labels?.length > 0 ? (
               <Box position="relative" h="400px">
                 <Pie options={categoryChartOptions} data={categoryChartData} />
               </Box>
             ) : (
               <Center h="400px"><Text color="gray.500">Sem dados para resumo por categoria.</Text></Center>
             )}
          </Box>

        </SimpleGrid>
      )}
       {!loading && !error && !(summaryData?.stacked_monthly_summary?.datasets?.length || summaryData?.category_summary?.labels?.length) && (
          <Center mt={10}> <Text color="gray.500">Não há dados suficientes para exibir os resumos.</Text> </Center>
       )}
    </Box>
  );
}

export default Dashboard;
