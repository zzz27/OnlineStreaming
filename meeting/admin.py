"""
    admin display
"""
from django.contrib import admin
from .models import User,Room,Messages
# Register your models here.

admin.site.register(User)
admin.site.register(Room)
admin.site.register(Messages)
