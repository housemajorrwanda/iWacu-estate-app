import django_filters
from .models import House, AdditionalFeatures
from django.db.models import Q

class HouseFilter(django_filters.FilterSet):
    price_min = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    house_category = django_filters.UUIDFilter(field_name='house_category__id')
    payment_category = django_filters.CharFilter(field_name='payment_category')
    address = django_filters.CharFilter(field_name='address', lookup_expr='icontains')
    
    search = django_filters.CharFilter(method='filter_search')

    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(address__icontains=value) |
                Q(description__icontains=value) |
                Q(price__icontains=value)
            )
        return queryset

    features = django_filters.CharFilter(method='filter_by_features')

    def filter_by_features(self, queryset, name, value):
        """
        Allows multiple ?features=wifi&features=rooms:4
        Supports:
            - feature name alone → requires house to have that feature
            - feature with number like rooms:4 → match available_number
            - fallback: if feature doesn't support number, ignore it
        """
        feature_filters = self.request.GET.getlist('features')

        for item in feature_filters:
            if ":" in item:
                try:
                    feature_name, number = item.split(":", 1)
                    feature_name = feature_name.strip()
                    number = number.strip()

                    # Get feature object by name
                    try:
                        feature_obj = AdditionalFeatures.objects.get(name__iexact=feature_name)
                        if feature_obj.show_available_number:
                            queryset = queryset.filter(
                                feature_assignments__feature=feature_obj,
                                feature_assignments__available_number=number
                            )
                        else:
                            # If it shouldn't have a number, just filter by feature name
                            queryset = queryset.filter(
                                feature_assignments__feature=feature_obj
                            )
                    except AdditionalFeatures.DoesNotExist:
                        continue

                except ValueError:
                    continue
            else:
                queryset = queryset.filter(
                    feature_assignments__feature__name__iexact=item.strip()
                )

        return queryset.distinct()

    class Meta:
        model = House
        fields = [
            'price_min', 'price_max', 'house_category', 'payment_category', 'address'
        ]
