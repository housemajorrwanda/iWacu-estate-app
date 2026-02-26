from django.db import models
import uuid
from django.conf import settings
from django.contrib.auth import get_user_model
# Create your models here.
class HouseCategory(models.Model):
    id=models.UUIDField(default=uuid.uuid4,editable=False,null=False,blank=False,primary_key=True,unique=True)
    name=models.CharField(max_length=255,unique=True)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural='House Categories'
# House Features like wifi,number of rooms
class AdditionalFeatures(models.Model):
    id=models.UUIDField(default=uuid.uuid4,editable=False,null=False,blank=False,primary_key=True,unique=True)
    name=models.CharField(max_length=255)
    icon=models.ImageField(upload_to='Features_icon/')
    show_available_number=models.BooleanField(default=False)
    show_icon_only=models.BooleanField(default=False)
    show_name_only=models.BooleanField(default=False)
    add_available_number=models.BooleanField(default=False)
    is_additional_image_required=models.BooleanField(default=False)
    is_custom = models.BooleanField(default=False) # To identify user-defined features
    def __str__(self):
        return self.name
# Hous Model
class Agent(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)
    status = models.CharField(max_length=20,default='owner')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    other_phone = models.CharField(max_length=20, blank=True, null=True)
    upi = models.CharField(max_length=50, blank=True, null=True)
    photo = models.ImageField(upload_to="agents/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
class House(models.Model):
    PAYMENT_CATEGORIES = (
        ('Rent', 'For Rent'),
        ('Sell', 'For Sell')
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    thumbnail = models.ImageField(upload_to='Houses/')
    house_category = models.ForeignKey(HouseCategory, on_delete=models.CASCADE)
    payment_category = models.CharField(choices=PAYMENT_CATEGORIES, max_length=30)
    address = models.CharField(max_length=255)
    agent=models.ForeignKey(Agent,on_delete=models.SET_NULL,related_name='houses',null=True,blank=True)
    latitude = models.DecimalField(max_digits=23, decimal_places=20, null=True, blank=True)
    longitude = models.DecimalField(max_digits=23, decimal_places=20, null=True, blank=True)

    price = models.IntegerField()
    description = models.TextField()

    is_booked = models.BooleanField(default=False)

    # ✅ NEW FIELD
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="uploaded_houses",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    house_features = models.ManyToManyField(
        to=AdditionalFeatures,
        through='HouseFeatureAssignment',
        related_name='houses'
    )
    

    def __str__(self):
        return str(self.id)


class HouseFeatureAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False,unique=True)
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='feature_assignments')
    # feature = models.ForeignKey(AdditionalFeatures, on_delete=models.CASCADE, related_name='feature_assignments')
    feature = models.ForeignKey(
    AdditionalFeatures,
    on_delete=models.CASCADE,
    related_name='feature_assignments',
    null=True,
    blank=True
)
    available_number = models.CharField(max_length=20, blank=True, null=True)
    custom_feature_name = models.CharField(max_length=255, blank=True, null=True) 
    def __str__(self):
        if self.feature:
            return f"{self.house.id} - {self.feature.name}"
        return f"{self.house.id} - {self.custom_feature_name}"

class HouseFeatureImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False,unique=True)
    assignment = models.ForeignKey(HouseFeatureAssignment, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='HouseFeaturePhotos/')

    def __str__(self):
        return f"Image for {self.assignment}"
class HouseImages(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,unique=True)
    house=models.ForeignKey(to=House,on_delete=models.CASCADE,related_name='house_images')
    images = models.ImageField(upload_to='Houses/house_images/')
class Proximity(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,unique=True)
    name=models.CharField(max_length=255)
    icon=models.ImageField(upload_to='approximity_icon/',null=True,blank=True)
    latitude = models.DecimalField(max_digits=23, decimal_places=20, null=True, blank=True)
    longitude = models.DecimalField(max_digits=23, decimal_places=20, null=True, blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

    


