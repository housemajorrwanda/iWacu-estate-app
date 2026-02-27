import requests
from .models import CustomUser

def send_push_notification(token, title, body):
    if not token:
        return

    message = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body,
    }

    response = requests.post(
        "https://exp.host/--/api/v2/push/send",
        json=message,
    )

    print("Expo response:", response.json())


def sendToAllUser(title, body):
    users = CustomUser.objects.exclude(push_token__isnull=True).exclude(push_token="",recieve_notification=False)

    for user in users:
        send_push_notification(user.push_token, title, body)