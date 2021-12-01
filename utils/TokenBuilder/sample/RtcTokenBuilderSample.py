#! /usr/bin/python
# ! -*- coding: utf-8 -*-
# pylint: skip-file
import sys
import os
import time
from random import randint
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.RtcTokenBuilder import RtcTokenBuilder,Role_Attendee

appID = "2aca04af4d1d44439917b31bd560704e"
appCertificate = "d981bf47e9ad4b98ab77724dbc341147"
channelName = "1"
uid = 0
#userAccount = "2882341273"
expireTimeInSeconds = 14400
currentTimestamp = int(time.time())
privilegeExpiredTs = currentTimestamp + expireTimeInSeconds


def main():
    token = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, Role_Attendee, privilegeExpiredTs)
    print(token)


if __name__ == "__main__":
    main()
