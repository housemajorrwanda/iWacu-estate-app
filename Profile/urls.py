# Profile/urls.py
from django.urls import path
from .views import RegisterView, LoginView,forgot_password,ProfileView,ClerkLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path("clerk-login/", ClerkLoginView.as_view()),

    path('profile/', ProfileView.as_view(), name='get_profile'),
    path('forgot-password/',forgot_password),
    
]

