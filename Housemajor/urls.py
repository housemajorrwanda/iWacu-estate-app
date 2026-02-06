
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from Profile.views import reset_password_form,reset_password
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',include('HouseManagement.urls')),
    path('api/auth/', include('Profile.urls')),
    path('reset-password/<uidb64>/<token>/', reset_password_form, name='reset_password_form'),
    path('reset-password-submit/<uidb64>/<token>/', reset_password, name='reset_password_submit'),
    path('api/payment/', include('Payment.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

