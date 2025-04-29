import datetime
from decimal import Decimal
from collections import defaultdict
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Value, DecimalField
from django.db.models.functions import TruncMonth, Coalesce
from django.utils import timezone

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

        monthly_category_query = Expense.objects \
            .annotate(month=TruncMonth('date'),
                      # Agrupa nulos como 'Sem Categoria'
                      category_name_agg=Coalesce('category__name', Value('Sem Categoria'))) \
            .values('month', 'category_name_agg') \
            .annotate(total=Sum('amount')) \
            .values('month', 'category_name_agg', 'total') \
            .order_by('month', 'category_name_agg') # Ordena para processamento

        datasets_by_category = defaultdict(lambda: defaultdict(float))
        all_months_set = set()
        all_categories_set = set()

        for item in monthly_category_query:
            # Ignora itens sem mês (não deveria acontecer com TruncMonth)
            if not item['month']:
                continue
            month_str = item['month'].strftime('%Y-%m')
            category_name = item['category_name_agg']
            total = float(item['total'] or 0)

            datasets_by_category[category_name][month_str] = total
            all_months_set.add(month_str)
            all_categories_set.add(category_name)

        sorted_months = sorted(list(all_months_set))
        sorted_categories = sorted(list(all_categories_set))

        chartjs_datasets = []
        colors = [
          'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)'
        ]
        color_index = 0
        for category in sorted_categories:
            # Para cada categoria, cria uma lista de valores para cada mês (0 se não houver gasto)
            data_points = [datasets_by_category[category].get(month, 0) for month in sorted_months]
            chartjs_datasets.append({
                'label': category, # Nome da categoria vai na legenda
                'data': data_points,
                'backgroundColor': colors[color_index % len(colors)], # Pega uma cor da paleta
            })
            color_index += 1

        stacked_monthly_summary_data = {
            'labels': sorted_months, # Meses no eixo X
            'datasets': chartjs_datasets # Um dataset por categoria
        }

        category_summary_query = Expense.objects \
            .annotate(cat_name=Coalesce('category__name', Value('Sem Categoria'))) \
            .values('cat_name') \
            .annotate(total=Sum('amount')) \
            .values('cat_name', 'total') \
            .order_by('-total')

        category_labels = [item['cat_name'] for item in category_summary_query]
        category_totals = [item['total'] or 0 for item in category_summary_query]

        category_summary_data = {
            'labels': category_labels,
            'totals': category_totals
        }

        combined_data = {
            'stacked_monthly_summary': stacked_monthly_summary_data,
            'category_summary': category_summary_data # Mantém o de pizza
        }

        return Response(combined_data)

class HomePageSummaryView(APIView):
    """
    API View to retrieve summary data for logged home page.
    """
    def get(self, request, format=None):
        now = timezone.now()
        current_month = now.month
        current_year = now.year

        first_day_current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_day_previous_month = first_day_current_month - datetime.timedelta(days=1)
        previous_month = last_day_previous_month.month
        previous_month_year = last_day_previous_month.year

        total_this_month = Expense.objects.filter(
            date__year=current_year,
            date__month=current_month
        ).aggregate(
            total=Coalesce(Sum('amount', output_field=DecimalField()), Decimal('0.00'))
        )['total']

        total_previous_month = Expense.objects.filter(
            date__year=previous_month_year,
            date__month=previous_month
        ).aggregate(
             total=Coalesce(Sum('amount', output_field=DecimalField()), Decimal('0.00'))
        )['total']

        top_category_this_month_data = Expense.objects.filter(
            date__year=current_year,
            date__month=current_month,
            category__isnull=False
        ).values(
            'category__name'
        ).annotate(
            total=Sum('amount')
        ).order_by('-total').first()

        recent_expenses_qs = Expense.objects.all().order_by('-date', '-pk')[:5]
        recent_expenses_serializer = ExpenseSerializer(recent_expenses_qs, many=True)

        data = {
            'summary_period_label': now.strftime('%m/%Y'),
            'current_month_total': total_this_month,
            'previous_month_total': total_previous_month,
            'top_category_current_month': top_category_this_month_data,
            'recent_expenses': recent_expenses_serializer.data
        }

        return Response(data)
