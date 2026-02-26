from rest_framework import serializers
from django.http import QueryDict
import re
from collections import defaultdict
from .models import (
    House, HouseCategory, AdditionalFeatures, HouseFeatureAssignment,
    HouseFeatureImage, HouseImages, Proximity, Agent
)
from Profile.serializers import ProfileSerializer

# --- Agent Serializer for creation ---
class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'


# --- Feature Images ---
class HouseFeatureImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseFeatureImage
        fields = ['id', 'image']

class AdditionalFeaturesSerializer(serializers.ModelSerializer):
    class Meta: 
        model = AdditionalFeatures
        fields = '__all__'
# --- Feature Assignment Serializer ---
class HouseFeatureAssignmentSerializer(serializers.ModelSerializer):
    images = HouseFeatureImageSerializer(many=True, required=False)
    feature_data = AdditionalFeaturesSerializer(source='feature', read_only=True)
    feature = serializers.PrimaryKeyRelatedField(
        queryset=AdditionalFeatures.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = HouseFeatureAssignment
        fields = [
            "id",
            "feature",
            "feature_data",
            "available_number",
            "custom_feature_name",
            "images",
        ]



# --- House Images Serializer ---
class HouseImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseImages
        fields = ['id', 'images']

class HouseCategorySerializer(serializers.ModelSerializer):
    class Meta: 
        model = HouseCategory
        fields = '__all__'


class ProximitySerializer(serializers.ModelSerializer):
    class Meta: 
        model = Proximity
        fields = '__all__'
# --- Main House Serializer ---


class HouseSerializer(serializers.ModelSerializer):
    agent = AgentSerializer()
    feature_assignments = HouseFeatureAssignmentSerializer(many=True, required=False)
    house_images = HouseImagesSerializer(many=True, read_only=True)  # Add this
    house_category_data = HouseCategorySerializer(source='house_category', read_only=True)  # Add this
    uploader_data = ProfileSerializer(source='uploaded_by', read_only=True)
    class Meta:
        model = House
        fields = [
            'id',
            'thumbnail',
            'house_category',
            'house_category_data',
            'payment_category',
            'address',
            'agent',
            'latitude',
            'longitude',
            'price',
            'description',
            'is_booked',
            'uploaded_by',
            'uploader_data',
            'created_at',
            'house_features',
            'feature_assignments',
            'house_images'
        ]

    def to_internal_value(self, data):
        # Your existing to_internal_value logic (unchanged)
        mutable_data = {}
        feature_map = {}
        agent_data = {}

        for key in data.keys():
            value = data.get(key)

            # ---------------- AGENT FIELDS ----------------
            agent_match = re.match(r"agent\[(\w+)\]", key)
            if agent_match:
                field = agent_match.group(1)
                agent_data[field] = value
                continue

            # ---------------- FEATURE FIELDS ----------------
            feature_match = re.match(r"feature_assignments\[(\d+)\]\[(\w+)\]", key)
            if feature_match:
                index, field = feature_match.groups()
                if index not in feature_map:
                    feature_map[index] = {"images": []}
                if field in ["feature", "available_number", "custom_feature_name"]:
                    feature_map[index][field] = value
                continue

            # ---------------- FEATURE IMAGES ----------------
            img_match = re.match(
                r"feature_assignments\[(\d+)\]\[images\]\[(\d+)\]\[image\]", key
            )
            if img_match:
                index, img_index = img_match.groups()
                if index not in feature_map:
                    feature_map[index] = {"images": []}
                feature_map[index]["images"].append({"image": value})
                continue

            # ---------------- NORMAL FIELDS ----------------
            mutable_data[key] = value

        # Attach nested objects
        if agent_data:
            mutable_data["agent"] = agent_data

        if feature_map:
            mutable_data["feature_assignments"] = list(feature_map.values())

        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        agent_data = validated_data.pop("agent")
        features_data = validated_data.pop("feature_assignments", [])

        agent = Agent.objects.create(**agent_data)
        house = House.objects.create(agent=agent, **validated_data)

        # Create feature assignments and their images
        for feature_data in features_data:
            images_data = feature_data.pop("images", [])

            feature = feature_data.get("feature")
            custom_name = feature_data.get("custom_feature_name")

            # Safety check: one of them must exist
            if not feature and not custom_name:
                continue

            assignment = HouseFeatureAssignment.objects.create(
                house=house,
                feature=feature if feature else None,
                available_number=feature_data.get("available_number"),
                custom_feature_name=custom_name if custom_name else None
            )

            for img in images_data:
                HouseFeatureImage.objects.create(
                    assignment=assignment,
                    image=img["image"]
                )
        # Create additional house images
        request = self.context.get("request")
        if request:
            images = request.FILES.getlist("additionalImage[]")
            for image_file in images:
                HouseImages.objects.create(
                    house=house,
                    images=image_file
                )

        # Reload the house instance to include all related fields
        house.refresh_from_db()
        return house


