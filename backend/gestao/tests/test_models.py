from decimal import Decimal
from datetime import date
from django.test import TestCase
from models import Expense

class ExpenseTestCase(TestCase):
    def setup(self):
        self.instance = Expense.objects.create(
            description="watter bill",
            amount=Decimal("103.20"),
            date=date(2025,2,1)
        )
    
    def test_expense_model_creation(self):
        self.assertEqual(self.instance.description, "water bill")
