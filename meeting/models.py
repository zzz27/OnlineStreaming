'''
Models for meeting
'''
from django.db import models


class User(models.Model):
    '''User Model'''
    username = models.CharField(unique=True, max_length=20)
    password = models.CharField(max_length=100)
    onlineStatus = models.BooleanField()
    role = models.CharField(max_length=10, default='None')  # wait to replace with an enum type.
    isAdmin = models.BooleanField(default=False)  # admin
    isAllowToSpeak = models.BooleanField(default=True)
    isMicrophoneOn = models.BooleanField(default=False)
    isApply = models.BooleanField(default=False)
    isLive = models.BooleanField(default=False)
    def __str__(self) -> str:
        return str(self.username)


class Messages(models.Model):
    """
        Messages models
    """
    content = models.CharField(max_length=1000)
    sender = models.CharField(max_length=20)
    reciever = models.CharField(max_length=20)
    pubTime =models.DateField(auto_now_add=True)


class Room(models.Model):
    '''Room Model'''
    roomId = models.AutoField(primary_key=True)  # with the incremental roomID automatically
    roomName = models.CharField(max_length=200)
    activeUserList = models.ManyToManyField(User, related_name='activeuserlist')
    currentStreamer = models.ForeignKey(User,
                                        on_delete=models.CASCADE,
                                        related_name='cur_streamer',
                                        null=True)
    streamer = models.ForeignKey(User,
                                 on_delete=models.CASCADE,
                                 related_name='streamer',
                                 null=True)
    isPrivate = models.BooleanField(default=False)
    permitUserList = models.ManyToManyField(User, related_name='permituserlist')
    guestList = models.ManyToManyField(User, related_name='guestlist')
    likeNumber = models.IntegerField(default=0)
    type = models.CharField(max_length=20)
    historyRecord= models.ManyToManyField(Messages, related_name='historyrecord')
