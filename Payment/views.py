from django.shortcuts import render
from rest_framework.views import APIView
import requests
import json
from django.conf import settings
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
# Create your views here.
# paypack App Id=dacc5eb6-f60a-11f0-8c67-deadd43720af
#paypack secret key= d522db6f4bddbd925890dcd30f068a8fda39a3ee5e6b4b0d3255bfef95601890afd80709
class PaymentView(APIView):
    base_url = "https://payments.paypack.rw/api" 
    # permission_classes = [IsAuthenticated]  # Allow any user (authenticated or not) to access this view
    def authentication_paypack(self,request):
        url = f'{self.base_url}/auth/agents/authorize'
        payload = json.dumps({
        "client_id": settings.PAYPACK_ID,
        "client_secret": settings.PAYPACK_SECRET_KEY
        })
        headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        # print(response.json())
        return response.json()
    def post(self, request):
        auth_response = self.authentication_paypack(request)
        access_token = auth_response.get('access')

        if not access_token:
            return Response({"error": "Authentication failed"}, status=500)

        url = f'{self.base_url}/transactions/cashin'
        payload = json.dumps({
        "amount": request.data.get('amount'),
      
        
        "number": request.data.get('customer_phone'),
        
        })
        headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
        }

        response = requests.request("POST", url, headers=headers, data=payload)
        return Response(response.json(), status=response.status_code)
