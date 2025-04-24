from rest_framework import serializers
from .models import Expense, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class ExpenseSerializer(serializers.ModelSerializer):

    category_name = serializers.StringRelatedField(source="category", read_only=True), 
    class Meta:
        model = Expense
        fields = ["id", "description", "amount", "date", "category"]

        extra_kwargs = {
            "category": {"required": False, "allow_null": True}
        }
