from rest_framework import serializers
from .models import SavedNumbers
class SavedNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model=SavedNumbers
        fields='__all__'
    