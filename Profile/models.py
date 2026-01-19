from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, email, phone_number, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not phone_number:
            raise ValueError("Phone number is required")
        if not extra_fields.get("full_name"):
            raise ValueError("Full name is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            phone_number=phone_number,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, phone_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("full_name", "Admin User")

        return self.create_user(email, phone_number, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ACCOUNT_TYPE_CHOICES = [
        ('owner', 'Owner'),
        ('retailer', 'Retailer'),
        ('buyer', 'Buyer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=13, unique=True)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='User_Profile/', null=True, blank=True)
    national_id = models.CharField(max_length=17, null=True, blank=True)
    account_type = models.CharField(max_length=15, choices=ACCOUNT_TYPE_CHOICES)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'phone_number', 'account_type']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.full_name} ({self.phone_number})"
