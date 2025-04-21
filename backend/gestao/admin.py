from django.contrib import admin

from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("description", "amount", "date", "id")
    list_filter = ("date",)
    search_fields = ("description",)
    date_hierarchy = "date"
    ordering = ("-date",)
