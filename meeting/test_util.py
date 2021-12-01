"""This module provides the test code of the user view.

"""
# pylint: skip-file
import sys
import unittest
import os
from django.test import TestCase
from utils.TokenBuilder.src.RtcTokenBuilder import RtcTokenBuilder,Role_Attendee,Role_Subscriber
from utils.TokenBuilder.src.AccessToken import AccessToken,kJoinChannel,kPublishVideoStream,kPublishAudioStream,kPublishDataStream
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


appID = "970CA35de60c44645bbae8a215061b33"
appCertificate = "5CFd2fd1755d40ecb72977518be15d3b"
channelName = "7d72365eb983485397e3e3f9d460bdda"
uid = 2882341273
expireTimestamp = 1446455471
joinTs =  1614049514
audioTs = 1614049515
videoTs = 1614049516
dataTs =  1614049517
salt = 1
ts = 1111111


class RtcTokenBuilderTest(TestCase):
    """
    This is a test class
    """
    def setUp(self) -> None:
        """
        set up function
        """
        self.appID = "970CA35de60c44645bbae8a215061b33"
        self.appCertificate = "5CFd2fd1755d40ecb72977518be15d3b"
        self.channelName = "7d72365eb983485397e3e3f9d460bdda"
        self.uid = 2882341273
        self.expireTimestamp = 1446455471
        self.salt = 1
        self.ts = 1111111

    def test_token(self):
        """
        test token function
        """
        token = RtcTokenBuilder.buildTokenWithUid(self.appID,
                self.appCertificate, self.channelName, self.uid,Role_Subscriber, self.expireTimestamp)
        parser = AccessToken()
        parser.fromString(token)

        self.assertEqual(parser.messages[kJoinChannel], expireTimestamp)
        self.assertNotIn(kPublishVideoStream, parser.messages)
        self.assertNotIn(kPublishAudioStream, parser.messages)
        self.assertNotIn(kPublishDataStream, parser.messages)



appID = "970CA35de60c44645bbae8a215061b33"
appCertificate = "5CFd2fd1755d40ecb72977518be15d3b"
channelName = "7d72365eb983485397e3e3f9d460bdda"
uid = 2882341273
expireTimestamp = 1446455471
salt = 1
ts = 1111111


class AccessTokenTest(TestCase):
    """
    this is another test class
    """
    def test_(self):
        """
        a test function
        """
        expected = "006970CA35de60c44645bbae8a215061b33IACV0fZUBw+72cVoL9eyGGh3Q6Poi8bgjwVLnyKSJyOXR7dIfRBXoFHlEAABAAAAR/QQAAEAAQCvKDdW"

        key = AccessToken(appID, appCertificate, channelName, uid)
        key.salt = salt
        key.ts = ts
        key.messages[kJoinChannel] = expireTimestamp

        result = key.build()
        self.assertEqual(expected, result)

        # test uid = 0
        expected = "006970CA35de60c44645bbae8a215061b33IACw1o7htY6ISdNRtku3p9tjTPi0jCKf9t49UHJhzCmL6bdIfRAAAAAAEAABAAAAR/QQAAEAAQCvKDdW"

        uid_zero = 0
        key = AccessToken(appID, appCertificate, channelName, uid_zero)
        key.salt = salt
        key.ts = ts
        key.messages[kJoinChannel] = expireTimestamp

        result = key.build()
        self.assertEqual(expected, result)
