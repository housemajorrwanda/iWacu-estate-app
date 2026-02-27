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
from django.views.decorators.csrf import csrf_exempt
# from django.http import HttpResponse
# import json
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
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
        'Authorization': f'Bearer {access_token}',
        'X-Webhook-Mode':'development'
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
            SavedNumbers.objects.get_or_create(
                user=request.user,
                phone_number=request.data.get('customer_phone')
            )
            # saveNumber.save()
        except:
            pass
        return Response(response.json(), status=response.status_code)


@csrf_exempt
def webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
        print("Webhook data:", data)

        transaction = data.get("data", {})

        ref = transaction.get("ref")
        status_value = transaction.get("status")
        amount = transaction.get("amount")

        if not ref:
            return JsonResponse({"message": "Missing ref"}, status=400)

        try:
            payment = Payments.objects.get(ref=ref)
            payment.payment_status = status_value
            payment.save()

            if status_value in ["successful", "completed"]:
                payment.house.is_booked = True
                payment.house.save()

        except Payments.DoesNotExist:
            Payments.objects.create(
                ref=ref,
                payment_status=status_value,
                amount=amount
            )

        return HttpResponse(status=200)

    except Exception as e:
        print("Webhook error:", str(e))
        return HttpResponse(status=400)
class CheckPaymentConfirmed(APIView):
    base_url = "https://payments.paypack.rw/api"
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
        reference_key = request.data.get('reference_key')
        phone_number=request.data.get('phone_number')
        auth_response = self.authentication_paypack(request)
        access_token = auth_response.get('access')
        if not reference_key:
            return Response(
                {"message": "Reference key is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # import requests

            url = f'{self.base_url}/events/transactions?ref={reference_key}&kind=CASHIN&client={phone_number}'

            payload={}
            headers = {
            'Accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
            }

            response = requests.request("GET", url, headers=headers, data=payload)

            print("text format",response.text)
            print("json format",response.json())
            response_data = response.json()

            try:
                status_value = response_data["transactions"][0]["data"]["status"]
            except (KeyError, IndexError, TypeError):
                return Response(
                    {"message": "Invalid Paypack response"},
                    status=400
                )

            payment = Payments.objects.get(ref=reference_key)
            if status_value and status_value != "pending" and payment.payment_status != status_value:
                payment.payment_status = status_value
                payment.save()
            
                print("payment status",payment.payment_status)
            if status_value in ["successful", "completed"]:
                payment.house.is_booked = True
                payment.house.save()
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
    