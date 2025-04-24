from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import TruncMonth

from .models import Expense, Category
from .serializers import ExpenseSerializer, CategorySerializer


class CategoryListView(generics.ListAPIView):
    """
    API View to list (GET) all available categories.
    """
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    # pagination_class = None

class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Expense.objects.all().order_by("-date")
    serializer_class = ExpenseSerializer

class ExpenseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class ExpenseSummaryView(APIView):
    def get(self, request, format=None):
        summary = Expense.objects \
            .annotate(month=TruncMonth('date')) \
            .values('month') \
            .annotate(total=Sum('amount')) \
            .values('month', 'total') \
            .order_by('month')

        labels = [item['month'].strftime('%Y-%m') for item in summary]
        totals = [item['total'] or 0 for item in summary]

        data = {
            'labels': labels,
            'totals': totals
        }
        return Response(data)
