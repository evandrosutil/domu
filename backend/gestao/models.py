from django.db import models
from django.utils import timezone

class Category(models.Model):
    """
    Represents a expense category.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Nome da categoria (ex: Limpeza, Manutenção, Salários)"
    )
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['name']

class Expense(models.Model):
    """
    Represents an expense recorded for the condominium.
    """
    description = models.CharField(max_length=255, help_text="Description of the expense")
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Expense amount (e.g., in BRL)"
    )
    date = models.DateField(
        default=timezone.now,
        help_text="Date the expense occurred or was recorded"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        help_text="Categoria da despesa"
    )

    def __str__(self):
        formatted_amount = f"{self.amount:.2f}"
        category_str = f" ({self.category.name})" if self.category else ""
        return f"{self.description}{category_str} ({formatted_amount}) - {self.date.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-date']
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"
