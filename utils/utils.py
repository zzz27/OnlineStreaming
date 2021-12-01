# -*- coding: utf-8 -*-
"""Some backend utils function.

This module provides some utils function.

"""

import time
import re
from django.http import JsonResponse
from meeting.models import Room
from utils.TokenBuilder.src.RtcTokenBuilder import RtcTokenBuilder
# some variables
appID = "2aca04af4d1d44439917b31bd560704e"
appCertificate = "d981bf47e9ad4b98ab77724dbc341147"
expireTimeInSeconds = 14400
currentTimestamp = int(time.time())
privilegeExpiredTs = currentTimestamp + expireTimeInSeconds

clients={}

def gen_response(code: int, data: str):
    """
        Generate jsonresponse.
    """
    print(data)
    return JsonResponse({
        'code': code,
        'data': data
    }, status=code)


def get_token(channelName, uid, Role_Attendee):
    """
        Get token if joinRoom successfully.
    """
    token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, Role_Attendee, privilegeExpiredTs)
    return JsonResponse({
        'code': 200,
        'data': token
    })


def check_username(username: str):
    '''
        Check the username is valid.
    '''
    #re_username = re.compile(r"[.]*")
    re_username = re.compile(r"^[＼x80-＼xffa-zA-Z][＼x80-＼xffa-zA-Z0-9]{3,19}")
    return re_username.match(username)