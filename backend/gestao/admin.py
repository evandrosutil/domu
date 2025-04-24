from django.contrib import admin

from .models import Expense, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', )
    search_fields = ('name', )

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("description", "amount", "date", "category", "id")
    list_filter = ("date", "category")
    search_fields = ("description", "category__name")
    date_hierarchy = "date"
    ordering = ("-date",)
    raw_id_fields = ("category",)
