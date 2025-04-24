from django.urls import path
from .views import (
    ExpenseListCreateAPIView, 
    ExpenseSummaryView, 
    ExpenseRetrieveUpdateDestroyAPIView,
    CategoryListView
)

urlpatterns = [
    path("expenses/", ExpenseListCreateAPIView.as_view(), name="expense-list-create"),
    path("expenses/summary/", ExpenseSummaryView.as_view(), name="expense-summary"),
    path("expenses/<int:pk>/", ExpenseRetrieveUpdateDestroyAPIView.as_view(), name="expense-detail"),

    path("categories/", CategoryListView.as_view(), name="category-list"),
]
