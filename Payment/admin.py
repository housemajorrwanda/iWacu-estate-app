from django.contrib import admin

from Payment.models import Payments
from Payment.models import SavedNumbers
# Register your models here.
admin.site.register(Payments)
admin.site.register(SavedNumbers)