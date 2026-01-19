# Profile/urls.py
from django.urls import path
from .views import RegisterView, LoginView,forgot_password,get_profile,ClerkLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path("clerk-login/", ClerkLoginView.as_view()),

    path('profile/', get_profile, name='get_profile'),
    path('forgot-password/',forgot_password),
    
]

