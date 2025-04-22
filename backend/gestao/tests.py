# domu/backend/gestao/tests.py
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from decimal import Decimal
from .models import Expense # Importa seu modelo

# Marca todos os testes neste arquivo para terem acesso ao BD Django
pytestmark = pytest.mark.django_db

def test_expense_model_creation_and_str():
    """Testa a criação de uma instância de Expense e seu método __str__."""
    expense = Expense.objects.create(
        description="Teste Gasto Modelo",
        amount=Decimal("99.99"),
        # date usa o default=timezone.now
    )
    assert expense.description == "Teste Gasto Modelo"
    assert expense.amount == Decimal("99.99")
    # Verifica se o __str__ contém partes esperadas (ajuste se o formato do seu __str__ for diferente)
    assert "Teste Gasto Modelo" in str(expense)
    assert "99.99" in str(expense) # Assumindo que amount está no __str__

def test_expense_list_api_endpoint():
    """Testa se o endpoint da API de listagem de despesas funciona."""
    client = APIClient() # Cliente para fazer requisições à API
    # Cria uma despesa de exemplo no banco de dados de teste
    Expense.objects.create(description="Teste Gasto API", amount=Decimal("50.00"))

    # Obtém a URL usando o nome que definimos em gestao/urls.py
    url = reverse('expense-list-create')
    response = client.get(url) # Faz uma requisição GET

    # Verifica se a resposta foi bem-sucedida (status 200 OK)
    assert response.status_code == status.HTTP_200_OK
    # Verifica se a resposta contém a estrutura esperada da paginação do DRF
    assert 'results' in response.data
    # Verifica se a despesa criada aparece nos resultados
    assert len(response.data['results']) >= 1
    assert response.data['results'][0]['description'] == "Teste Gasto API"

# Você pode adicionar mais testes aqui (ex: para o endpoint de summary)
# def test_expense_summary_api_endpoint():
#     client = APIClient()
#     Expense.objects.create(description="Jan Expense", amount=Decimal("100.00"), date="2025-01-15")
#     Expense.objects.create(description="Feb Expense", amount=Decimal("200.00"), date="2025-02-10")
#     url = reverse('expense-summary')
#     response = client.get(url)
#     assert response.status_code == status.HTTP_200_OK
#     assert 'labels' in response.data
#     assert 'totals' in response.data
#     assert response.data['labels'] == ['2025-01', '2025-02'] # Ajuste as datas conforme seus testes
#     assert response.data['totals'] == [Decimal("100.00"), Decimal("200.00")]
