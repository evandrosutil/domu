from rest_framework import generics
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Expense.objects.all().order_by("-date")
    serializer_class = ExpenseSerializer
