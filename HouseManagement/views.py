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
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = HouseFilter
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        print("Creating house:", self.request.data)
        serializer.save(uploaded_by=self.request.user)

class HouseCategoryViewSet(viewsets.ModelViewSet):
    queryset = HouseCategory.objects.all()
    serializer_class = HouseCategorySerializer

class AdditionalFeaturesViewSet(viewsets.ModelViewSet):
    queryset = AdditionalFeatures.objects.all()
    serializer_class = AdditionalFeaturesSerializer
class ProximityViewSet(viewsets.ModelViewSet):
    queryset=Proximity.objects.all()
    serializer_class=ProximitySerializer