from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):

    def has_object_permission(self, request, view, obj):
        # Allow read-only methods
        if request.method in SAFE_METHODS:
            return True

        # Allow only owner to modify
        return obj.uploaded_by == request.user
