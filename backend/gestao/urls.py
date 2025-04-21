from django.urls import path
from .views import ExpenseListCreateAPIView

urlpatterns = [
    path("expenses/", ExpenseListCreateAPIView.as_view(), name="expense-list-create"),
]
