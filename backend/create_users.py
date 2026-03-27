# backend/create_users.py
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users = [
    {"username": "anshika.tiwari", "first_name": "Anshika", "last_name": "Tiwari"},
    {"username": "ravi.singh", "first_name": "Ravi", "last_name": "Singh"},
    {"username": "vaibhav.kumar", "first_name": "Vaibhav", "last_name": "Kumar"},
    {"username": "harshit.shukla", "first_name": "Harshit", "last_name": "Shukla"},
    {"username": "shifali.gupta", "first_name": "Shifali", "last_name": "Gupta"},
    {"username": "meghana.singh", "first_name": "Meghana", "last_name": "Singh"},
    {"username": "nimisha.singh", "first_name": "Nimisha", "last_name": "Singh"},
    {"username": "shipra.singh", "first_name": "Shipra", "last_name": "Singh"},
    {"username": "uprety.vaibhav", "first_name": "Uprety", "last_name": "Vaibhav"},
    {"username": "vaibhav.kumar2", "first_name": "Vaibhav", "last_name": "Kumar"},
]

for u in users:
    user, created = User.objects.get_or_create(
        username=u["username"],
        defaults={
            "first_name": u["first_name"],
            "last_name": u["last_name"],
            "password": "defaultpass123"  # change later
        }
    )
    if created:
        user.set_password("defaultpass123")
        user.save()
        print(f"Created: {u['username']}")
    else:
        print(f"Already exists: {u['username']}")