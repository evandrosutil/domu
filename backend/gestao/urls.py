from django.urls import path
from .views import ExpenseListCreateAPIView, ExpenseSummaryView

urlpatterns = [
    path("expenses/", ExpenseListCreateAPIView.as_view(), name="expense-list-create"),
    path("expenses/summary/", ExpenseSummaryView.as_view(), name="expense-summary"),
]
