from django.urls import path
from .views import PaymentView,webhook,CheckPaymentConfirmed,SavedNumberListCreateView
urlpatterns = [
    path('pay/', PaymentView.as_view(), name='initiate_payment'),
    path('webhook/', webhook, name='webhook'),
    path('check-payment/', CheckPaymentConfirmed.as_view(), name='check_payment'),
    path("savedNumbers",SavedNumberListCreateView.as_view())
    
]