# views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import House, HouseCategory, AdditionalFeatures,Proximity
from .serializers import HouseSerializer, HouseCategorySerializer, AdditionalFeaturesSerializer,ProximitySerializer
from django_filters import rest_framework as filters
from rest_framework.parsers import MultiPartParser, FormParser
from .filters import HouseFilter
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .permission import IsOwnerOrReadOnly
class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all()
    serializer_class = HouseSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Validation failed",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save(uploaded_by=request.user)

        return Response(
            {
                "success": True,
                "message": "House created successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )
class HouseCategoryViewSet(viewsets.ModelViewSet):
    queryset = HouseCategory.objects.all()
    serializer_class = HouseCategorySerializer

class AdditionalFeaturesViewSet(viewsets.ModelViewSet):
    queryset = AdditionalFeatures.objects.all()
    serializer_class = AdditionalFeaturesSerializer
class ProximityViewSet(viewsets.ModelViewSet):
    queryset=Proximity.objects.all()
    serializer_class=ProximitySerializer