# Profile/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth.password_validation import validate_password
from django.db.models import Count,Sum
from django.utils.timezone import now
from HouseManagement.models import House
from datetime import datetime
from django.utils.timezone import now
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "password",
            "account_type",
        ]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )
        return value

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "This phone number is already registered."
            )
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        Token.objects.create(user=user)
        return user



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data['email'].strip().lower()  # normalize case
        password = data['password']

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid login credentials")

        data['user'] = user
        return data


class ProfileSerializer(serializers.ModelSerializer):
    total_uploaded = serializers.SerializerMethodField()
    total_booked = serializers.SerializerMethodField()
    total_available = serializers.SerializerMethodField()
    monthly_stats = serializers.SerializerMethodField()
    favorite_locations = serializers.SerializerMethodField()
    transactions = serializers.SerializerMethodField()
    expenses = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "phone_number",
            "profile_picture",
            "national_id",
            "account_type",
            "date_joined",
            "email",
            "total_uploaded",
            "total_booked",
            "total_available",
            "monthly_stats",
            "transactions",
            "favorite_locations",
            "expenses"
        ]
        read_only_fields = ["email", "id", "date_joined", "total_uploaded", "total_booked", "total_available", "monthly_stats", "favorite_locations"]

    def get_total_uploaded(self, obj):
        return obj.uploaded_houses.count()

    def get_total_booked(self, obj):
        return obj.uploaded_houses.filter(is_booked=True).count()

    def get_total_available(self, obj):
        return obj.uploaded_houses.filter(is_booked=False).count()

    

    def get_monthly_stats(self, obj):
        current_date = now()
        current_year = current_date.year
        current_month = current_date.month

        months = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"]

        data = []

        # Iterate over the last 6 months
        for i in range(5, -1, -1):  # 5 months ago to current month
            # Calculate the year and month properly (handles year change)
            month = current_month - i
            year = current_year
            if month <= 0:
                month += 12
                year -= 1

            count = obj.uploaded_houses.filter(
                created_at__year=year,
                created_at__month=month
            ).count()

            data.append({
                "month": months[month-1],
                "value": count
            })

        return data


    def get_favorite_locations(self, obj):
        locations = (
            obj.uploaded_houses
            .values("address")
            .annotate(total=Count("address"))
            .order_by("-total")[:5]
        )
        return [loc["address"] for loc in locations]
    
    def get_transactions(self, obj):
        return obj.transactions.filter(payment_status='completed').count()
    
    def get_expenses(self, obj):
        return obj.transactions.filter(payment_status='completed').aggregate(Sum('amount'))['amount__sum'] or 0