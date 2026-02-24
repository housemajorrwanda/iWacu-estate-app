from django.db import models
from django.contrib.auth import get_user_model
# Create your models here.
User=get_user_model()
class Payments(models.Model):
    payment_status_choices=(
        ('pending','pending'),
        ('failed','failed'),
        ('completed','completed')
    )
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='transactions')
    amount=models.IntegerField()
    phone_number=models.CharField(max_length=14)
    payment_status=models.CharField(choices=payment_status_choices,max_length=40)
    ref=models.CharField(max_length=100)
    created_at=models.DateTimeField(auto_now_add=True)
    