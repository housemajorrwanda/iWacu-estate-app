# Profile/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer,ProfileSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth import get_user_model
from django.shortcuts import render
from django.conf import settings
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from rest_framework.generics import RetrieveUpdateAPIView
from django.db import IntegrityError
import logging
#For Clerk authentication
CLERK_SECRET_KEY = settings.CLERK_SECRET_KEY
clerk_sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)
url=settings.EMAIL_URL
User = get_user_model()
token_generator = PasswordResetTokenGenerator()
import requests
from django.core.files.base import ContentFile


def save_image_from_url(user, image_url):
    if not image_url:
        return

    try:
        response = requests.get(image_url)
        if response.status_code == 200:
            file_name = f"profile_{user.id}.jpg"
            user.profile_picture.save(
                file_name,
                ContentFile(response.content),
                save=False
            )
    except Exception as e:
        print("Image download error:", e)
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)

            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
    
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If that email exists, a reset link will be sent."}, status=200)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = token_generator.make_token(user)
    reset_link = f"{url}/reset-password/{uid}/{token}/"

    # Render HTML email
    subject = "Password Reset Request"
    from_email = None
    html_content = render_to_string("emails/reset_password.html", {
        "full_name": user.full_name,
        "reset_link": reset_link
    })
    msg = EmailMultiAlternatives(subject, "", from_email, [email])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    return Response({"message": "If that email exists, a reset link will be sent."}, status=200)

@api_view(['POST'])
def reset_password(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Invalid link"}, status=400)

    if not token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired token"}, status=400)

    new_password = request.data.get('password')
    if not new_password:
        return Response({"error": "Password is required"}, status=400)

    user.set_password(new_password)
    user.save()

    return render(request,'reset_success.html')
def reset_password_form(request, uidb64, token):
    """Show the reset password form"""
    context = {
        "uidb64": uidb64,
        "token": token
    }
    return render(request, "reset_password_form.html", context)




logger = logging.getLogger(__name__)


class ClerkLoginView(APIView):
    def post(self, request):
        try:
            # 🔍 Check Authorization header early
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                return Response(
                    {"detail": "Authorization header missing"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # 🔐 Authenticate with Clerk
            request_state = clerk_sdk.authenticate_request(
                request,
                AuthenticateRequestOptions()
            )

            if not request_state.is_signed_in:
                return Response(
                    {"detail": "Invalid or expired Clerk session"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # ✅ Extract payload safely
            payload = request_state.payload or {}
            clerk_user_id = payload.get("sub")

            if not clerk_user_id:
                return Response(
                    {"detail": "Invalid Clerk payload"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 🔍 Fetch Clerk user
            try:
                clerk_user = clerk_sdk.users.get(user_id=clerk_user_id)
            except Exception as clerk_error:
                logger.exception("Clerk user fetch failed")
                return Response(
                    {"detail": "Failed to fetch user from Clerk"},
                    status=status.HTTP_502_BAD_GATEWAY
                )

            email = clerk_user.email_addresses[0].email_address
            full_name = f"{clerk_user.first_name or ''} {clerk_user.last_name or ''}".strip()
            image_url = clerk_user.image_url

            # 🗄️ Create or get local user
            try:
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        "full_name": full_name,
                        "account_type": "buyer",
                        # "profile_picture": image_url,
                    }
                )
                if created:
                    save_image_from_url(user, image_url)
                    user.save()
            except IntegrityError:
                return Response(
                    {"detail": "Database error while creating user"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "token": token.key,
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "image": image_url,
                    "created": created,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Unexpected Clerk auth error")

            return Response(
                {
                    "detail": "Authentication failed",
                    "error": str(e)  # remove in production if you want
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user