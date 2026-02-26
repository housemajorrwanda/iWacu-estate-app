from django.shortcuts import render
from rest_framework.views import APIView
import requests
import json
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Payments,SavedNumbers
from HouseManagement.models import House
from rest_framework.generics import ListCreateAPIView
from .serializer import SavedNumberSerializer 
# Create your views here.
# paypack App Id=dacc5eb6-f60a-11f0-8c67-deadd43720af
#paypack secret key= d522db6f4bddbd925890dcd30f068a8fda39a3ee5e6b4b0d3255bfef95601890afd80709
class PaymentView(APIView):
    permission_classes = [IsAuthenticated]  # Allow any user (authenticated or not) to access this view
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
        house_id=request.data.get("houseId")
        try:
            house=House.objects.get(id=house_id)
            if house.is_booked:
                return Response({
                    "error":"House Booked",
                    "details":"House has been already booked please contact the owner for more details"
                },status=400)
        except House.DoesNotExist:
            return  Response({
                "error":"House is not foound",
                "details":"The Choosen House is not found please check another house"
            },status=404)  
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
        if response.status_code != 200:
            return Response({"error": "Transaction failed", "details": response.json()}, status=response.status_code)
        payment=Payments.objects.create(
            user=request.user,
            house=house,
            amount=request.data.get('amount'),
            phone_number=request.data.get('customer_phone'),
            payment_status='pending',
            ref=response.json().get('ref')
        )
        payment.save()
        try:
            SavedNumbers.objects.create(
                user=request.user,
                phone_number=request.data.get('customer_phone')
            )
            # saveNumber.save()
        except:
            pass
        return Response(response.json(), status=response.status_code)
def webhook(request):
    data = json.loads(request.body.decode('utf-8'))
    print("Webhook data:", data)
    event_id = data.get('event_id')
    kind = data.get('kind')
    transaction_data = data.get('data', {})
    ref = transaction_data.get('ref')
    status = transaction_data.get('status')
    amount = transaction_data.get('amount')
    try:
        payment = Payments.objects.get(ref=ref)
        payment.payment_status=status
        payment.save()
        if status in ['successful', 'completed']:
            payment.house.is_booked = True
            payment.house.save()
        # print(payment)
    except Payments.DoesNotExist:
        payment = Payments.objects.create(ref=ref, payment_status=status, amount=amount)
        payment.save()
    
    return Response({"message": "Webhook received"})
class CheckPaymentConfirmed(APIView):
    def post(self, request):
        reference_key = request.data.get('reference_key')

        if not reference_key:
            return Response(
                {"message": "Reference key is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = Payments.objects.get(ref=reference_key)
            print("payment status",payment.payment_status)
            if payment.payment_status == 'completed' or payment.payment_status == 'successful':
                return Response(
                    {"message": "Payment successful.", "completed": True,"status":"success"},
                    status=status.HTTP_200_OK
                )

            elif payment.payment_status == 'failed':
                return Response(
                    {"message": "Payment failed.", "failed": True,"status":"failed"},
                    status=status.HTTP_402_PAYMENT_REQUIRED  # more appropriate than 400
                )

            else:  # pending or processing
                return Response(
                    {"message": "Payment is pending.", "pending": True,"status":"pending"},
                    status=status.HTTP_202_ACCEPTED
                )

        except Payments.DoesNotExist:
            return Response(
                {"message": "Payment with the provided reference key was not found."},
                status=status.HTTP_404_NOT_FOUND
            )
class SavedNumberListCreateView(ListCreateAPIView):
    serializer_class = SavedNumberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedNumbers.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    