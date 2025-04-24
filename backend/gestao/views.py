from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Value
from django.db.models.functions import TruncMonth, Coalesce

from .models import Expense, Category
from .serializers import ExpenseSerializer, CategorySerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    """
    API View to list (GET) and create (POST) categories.
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    # pagination_class = None

class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Expense.objects.all().order_by("-date")
    serializer_class = ExpenseSerializer

class ExpenseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class ExpenseSummaryView(APIView):
    """
    API View that retrieves expense summary:
    - Total by month
    - Total by category
    """
    def get(self, request, format=None):
        monthly_summary_query = Expense.objects \
            .annotate(month=TruncMonth('date')) \
            .values('month') \
            .annotate(total=Sum('amount')) \
            .values('month', 'total') \
            .order_by('month')

        monthly_labels = [item['month'].strftime('%Y-%m') for item in monthly_summary_query]
        monthly_totals = [item['total'] or 0 for item in monthly_summary_query]

        monthly_summary_data = {
            'labels': monthly_labels,
            'totals': monthly_totals
        }

        category_summary_query = Expense.objects \
            .annotate(
                category_name_agg=Coalesce('category__name', Value('Sem Categoria'))
            ) \
            .values('category_name_agg') \
            .annotate(total=Sum('amount')) \
            .values('category_name_agg', 'total') \
            .order_by('-total')

        category_labels = [item['category_name_agg'] for item in category_summary_query]
        category_totals = [item['total'] or 0 for item in category_summary_query]

        category_summary_data = {
            'labels': category_labels,
            'totals': category_totals
        }

        combined_data = {
            'monthly_summary':  monthly_summary_data,
            'category_summary': category_summary_data
        }
            
        return Response(combined_data)
