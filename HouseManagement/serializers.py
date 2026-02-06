from rest_framework import serializers
from django.http import QueryDict
import re
from collections import defaultdict
from .models import (
    House, HouseCategory, AdditionalFeatures, HouseFeatureAssignment,
    HouseFeatureImage, HouseImages, Proximity, Agent
)


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
    feature=AdditionalFeaturesSerializer(required=False)
    class Meta:
        model = HouseFeatureAssignment
        fields = [
            "id",
            "feature",
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
import re
from collections import defaultdict

class HouseSerializer(serializers.ModelSerializer):
    agent = AgentSerializer()
    feature_assignments = HouseFeatureAssignmentSerializer(many=True, required=False)
    house_images = HouseImagesSerializer(many=True, read_only=True)  # Add this

    class Meta:
        model = House
        fields = "__all__"

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
                if field in ["feature", "available_number"]:
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
            assignment = HouseFeatureAssignment.objects.create(
                house=house, **feature_data
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


