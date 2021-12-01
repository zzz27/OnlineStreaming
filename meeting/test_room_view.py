"""
This module provides the test code of the user view.
"""
# pylint: skip-file
from django.http import response
from django.test import TestCase
from .models import Messages, User, Room
import json

class TestRoom(TestCase):
    """
    This class provides the test module
    """
    def setUp(self):
        """
        setup: Run once for every test method to setup clean data.
        """
        User.objects.create(username='Alice', password='alice', onlineStatus=True, isAdmin=True )
        User.objects.create(username='Bob',   password='bob',   onlineStatus=True, isAdmin=False)
        User.objects.create(username='Candy', password='candy', onlineStatus=True, isAdmin=False)
        User.objects.create(username='David', password='david', onlineStatus=True, isAdmin=False)
        User.objects.create(username='Frank', password='frank', onlineStatus=False, isAdmin=False)

    def room_create(self, username, streamername, roomname, isprivate,
                    permituserlist, guestlist, type,isget=False):
        """
            create the room with 6 pramaters
        """
        userlist = [{'username': x} for x in permituserlist]
        guestlist = [{'username': x} for x in guestlist]
        payload = {
            'username': username,
            'streamer': streamername,
            'roomName': roomname,
            'isPrivate': isprivate,
            'permitUserList': userlist,
            'guestList': guestlist,
            'type': type
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        if isget:
            return self.client.get('/api/create_room',
            data=payload_remove_none, content_type="application/json")
        return self.client.post('/api/create_room',
            data=payload_remove_none, content_type="application/json")

    def test_room_create_wrong_auth(self):
        """
            test1
        """
        response = self.room_create('Bob','Candy','room_wrong_auth',
                                    True,['Alice','Bob','Candy'], [], 'core')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Room.objects.all().exists())


    def test_room_create_creator_nonexist(self):
        """
        test function
        """
        response = self.room_create('alice', 'Candy', 'no user',
                                    False, ['Alice', 'Candy', 'David', 'Eve'], [], 'core')
        self.assertEqual(response.status_code, 400)

    def test_room_create_streamer_nonexist(self):
        """
        test function
        """
        response = self.room_create('Alice', 'candy', 'no user',
                                    False, ['Alice', 'Candy', 'David', 'Eve'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_create_streamer_notin_permit(self):
        """
        test function
        """
        response = self.room_create('Alice', 'Bob', 'streamer not in permit',
                                    True, ['Alice', 'Candy'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_create_guest_notin_permit(self):
        """
        test function
        """
        response = self.room_create('Alice', 'Bob', 'guest not permit',
                                    True, ['Alice', 'Bob', 'Candy'], ['David'], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_create_guest_not_exist(self):
        """
        test function
        """
        response = self.room_create('Alice', 'Bob', 'guest not exist',
                                    True, ['Alice', 'Bob', 'Candy'], ['Eve'], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_create_user_nonexist(self):
        """
            test2
        """
        response = self.room_create('Alice', 'Candy', 'no user',
                                    False, ['Alice', 'Candy', 'David', 'Eve'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_create_guest_wrong(self):
        """
        test function
        """
        response = self.room_create('Alice', 'Candy', 'guest',
                                    True, ['Alice', 'Bob', 'Candy'], ['Eve'], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_create_guest_wrong2(self):
        """
        test function
        """
        response = self.room_create('Alice', 'Candy', 'guest',
                                    True, ['Alice', 'Bob', 'Candy'], ['David'], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_create_success(self):
        """
            test3
        """
        response = self.room_create('Alice', 'Bob', 'Room 1', True,
                                    ['Alice', 'Bob', 'Candy'], ['Candy'], 'core')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Room.objects.filter(roomId=1).exists())
        response = self.room_create('Alice', 'Bob', 'Room 1', True,
                                    ['Alice', 'Bob', 'Candy'], ['Candy'], 'core',1)
        self.assertEqual(response.status_code, 400)

    def room_join(self, username, roomid, role,isget=False):
        """
            join the room
        """
        payload = {
            'username': username,
            'roomId': roomid,
            'role': role,
            'testFlag': True
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        if isget:
            return self.client.get('/api/join_room',
            data=payload_remove_none, content_type="application/json")
        return self.client.post('/api/join_room',
        data=payload_remove_none, content_type="application/json")

    def test_room_join_no_room(self):
        """
            test4
        """
        response = self.room_join('Bob', 1, 'audience')
        self.assertEqual(response.status_code,400)


    def test_room_join_user_nonexist(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_join('Eve', 1, 'audience')
        self.assertEqual(response.status_code, 400)


    def test_room_join_offline(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_join('Frank', 1, 'audience')
        self.assertEqual(response.status_code, 400)


    def test_room_join_double_room(self):
        """
        test function
        """
        response = self.room_create('Alice','Bob','Room1',True,['Alice','Bob','Candy'],[],'core')
        response = self.room_create('Alice','Bob','Room2',True,['Alice','Bob','Candy'],[],'core')
        self.assertEqual(response.status_code, 200)
        response = self.room_join('Bob', 1, 'host')
        self.assertEqual(response.status_code, 200)
        response = self.room_join('Bob', 2, 'audience')
        self.assertEqual(response.status_code, 400)


    def test_room_join_second_host(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_join('Bob', 1, 'host')
        response = self.room_join('Candy', 1, 'host')
        self.assertEqual(response.status_code, 400)


    def test_room_join_no_auth(self):
        """
            test5
        """
        self.test_room_create_success()
        response = self.room_join('David', 1, 'audience')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Room.objects.filter(roomId=1).first().
            activeUserList.filter(username='David').exists())


    def test_room_join_no_streamer_auth(self):
        """
            test6
        """
        self.test_room_create_success()
        response = self.room_join('Candy', 1, 'host')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(Room.objects.filter(roomId=1).first().
            activeUserList.filter(username='David').exists())


    def test_room_join_success(self):
        """
            test7
        """
        self.test_room_create_success()
        response = self.room_join('Bob', 1, 'host')
        self.assertEqual(response.status_code, 200)
        response = self.room_join('Bob', 1, 'host',1)
        self.assertEqual(response.status_code, 400)
        self.assertTrue(Room.objects.filter(roomId=1).first().
            activeUserList.filter(username='Bob').exists())
        self.assertEqual(Room.objects.filter(roomId=1).first().
            currentStreamer, User.objects.filter(username='Bob').first())
        response = self.room_join('Candy', 1, 'audience')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Room.objects.get(roomId=1).activeUserList.all().
                        filter(username='Candy').exists())


    def room_edit(self, username, streamer, roomId, roomName, isPrivate,
                    permitUserList, guestList, type):
        """
        test the room edit api
        """
        userlist = [{'username': x} for x in permitUserList]
        guestlist = [{'username': x} for x in guestList]
        payload = {
            'username': username,
            'streamer': streamer,
            'roomId': roomId,
            'roomName': roomName,
            'isPrivate': isPrivate,
            'permitUserList': userlist,
            'guestList': guestlist,
            'type': type
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        return self.client.post('/api/edit_room',data=payload_remove_none,
                                    content_type="application/json")

    def test_clear_chatroom_record(self):
        """
        test function
        """
        self.test_room_create_success()
        payload = {
            'roomId': 1,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        self.client.post('/api/clear_chatroom_record',data=payload_remove_none,
        content_type="application/json")


    def test_room_edit_success(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_edit('Alice', 'Bob', 1, 'Room 1 edited', True,
                                    ['Alice', 'Bob', 'Candy', 'David'], ['Alice', 'David'], 'core')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Room.objects.get(roomId=1).permitUserList.all().
                            filter(username='David').exists())
        self.assertTrue(Room.objects.get(roomId=1).roomName == 'Room 1 edited')


    def test_room_edit_no_auth(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_edit('Bob', 'Candy', 1, "Room 1 edited", True,
                                    ['Alice', 'Bob', 'Candy'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_edit_user_nonexist(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_edit('alice', 'Bob', 1, 'Room 1 edited', True,
                                    ['Alice', 'Bob', 'Candy', 'David'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_edit_streamer_nonexist(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_edit('Alice', 'bob', 1, 'Room 1 edited', True,
                                    ['Alice', 'Bob', 'Candy', 'David'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_edit_streamer_notin_permit(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_edit('Alice', 'Bob', 1, 'Room 1 edited', True,
                                    ['Alice', 'Candy', 'David'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_edit_guest_wrong(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_edit('Alice', 'Bob', 1, 'Room 1 edited', True,
                                    ['Alice', 'Bob', 'Candy', 'David'], ['Eve'], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_edit_guest_wrong2(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_edit('Alice', 'Bob', 1, 'Room 1 edited', True,
                                    ['Alice', 'Bob', 'Candy', 'David'], ['Frank'], 'core')
        self.assertEqual(response.status_code, 400)


    def test_room_edit_room_noexist(self):
        """
        test function
        """
        response = self.room_edit('Alice', 'Bob', 1, 'Room 1 edited', True,
                                    ['Alice', 'Bob', 'Candy', 'David'], [], 'core')
        self.assertEqual(response.status_code, 400)


    def room_exit(self, username, roomId):
        """
        test the room exit api
        """
        payload = {
            'username': username,
            'roomId': roomId,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.post('/api/exit_room', data=payload_remove_none,
                                content_type="application/json")


    def test_room_exit_success(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.room_exit('Candy', 1)
        self.assertEqual(response.status_code, 200)
        response = self.room_exit('Bob', 1)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Room.objects.get(roomId=1).activeUserList.
                            all().exists())


    def test_room_exit_no_user(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.room_exit('David', 1)
        self.assertEqual(response.status_code, 400)


    def test_room_exit_user_nonexist(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.room_exit('Eve', 1)
        self.assertEqual(response.status_code, 400)


    def test_room_exit_no_room(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.room_exit('Bob', 2)
        self.assertEqual(response.status_code, 400)


    def room_delete(self, username, roomId):
        """
        test the room delete api
        """
        payload = {
            'username': username,
            'roomId': roomId,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.post('/api/delete_room', data=payload_remove_none,
                                    content_type="application/json")


    def test_room_delete_no_auth(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_delete('Bob', 1)
        self.assertEqual(response.status_code, 400)


    def test_room_delete_no_room(self):
        """
        test function
        """
        response = self.room_delete('Alice', 1)
        self.assertEqual(response.status_code, 400)


    def test_room_delete_user_noexist(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.room_delete('Eve', 1)
        self.assertEqual(response.status_code, 400)


    def test_room_delete_success(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.room_delete('Alice', 1)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Room.objects.filter(roomId=1).exists())


    def get_user_room(self, username, getType):
        """
        test the api
        """
        payload = {
            'username': username,
            'getType': getType
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.post('/api/get_user_room', data=payload_remove_none,
                                    content_type="application/json")


    def test_get_user_room(self):
        """
        test function
        """
        self.test_room_edit_success()
        response = self.get_user_room('Alice', 'manage')
        self.assertTrue(Room.objects.get(roomId=1).
            permitUserList.filter(username='Candy').exists())


    def test_get_user_room_wrong(self):
        """
        test function
        """
        self.test_room_edit_success()
        response = self.get_user_room('Eve', 'manage')
        self.assertEqual(response.status_code, 400)


    def thumb_up_room(self, roomId):
        """
        test the api
        """
        payload = {
            'roomId': roomId
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.post('/api/thumb_up', data=payload_remove_none,
                                    content_type="application/json")


    def test_thumb_up_room(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.thumb_up_room(1)
        response = self.thumb_up_room(1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Room.objects.get(roomId=1).likeNumber, 2)


    def test_thumb_up_wrong(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.thumb_up_room(2)
        self.assertEqual(response.status_code, 400)


    def send_chat(self, roomId, content, sorUser, tarUser):
        """
        test the api
        """
        payload = {
            'roomId': roomId,
            'content': content,
            'sourceUser': sorUser,
            'targetUser': tarUser,
            'istest': True,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.post('/api/send_message', data=payload_remove_none,
                                    content_type="application/json")


    def test_send_chat_empty_content(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.send_chat(1, '', 'Alice', 'Bob')
        self.assertEqual(response.status_code, 400)

    def test_send_chat_toolong_content(self):
        """
        test function
        """
        self.test_room_join_success()
        str=""
        for i in range(0,10000):
            str=str+"1"
        response = self.send_chat(1, str, 'Alice', 'Bob')
        self.assertEqual(response.status_code, 400)


    def test_send_chat_room_nonexist(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.send_chat(2, 'hello world!', 'Alice', 'Bob')
        self.assertEqual(response.status_code, 400)


    def test_send_chat_success_private(self):
        self.test_room_join_success()
        response = self.send_chat(1, 'hello world!', 'Alice', 'Bob')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Messages.objects.exists())

    def test_send_chat_success_toall(self):
        self.test_room_join_success()
        response = self.send_chat(1, 'hello world!', 'Alice', 'To All')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Messages.objects.exists())


    def all_rooms(self):
        """
        test the api
        """
        return self.client.get('/api/all_rooms')


    def test_all_rooms(self):
        """
        test function
        """
        response = self.all_rooms()
        self.assertEqual(response.status_code, 200)


    def one_room(self, roomId):
        """
        test the api
        """
        payload = {
            'roomId': roomId,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.post('/api/one_room', data=payload_remove_none,
                                    content_type="application/json")


    def test_one_room(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.one_room(1)
        self.assertEqual(response.status_code, 200)


    def clear_rooms(self):
        """
        test the api
        """
        return self.client.get('/api/clear_rooms')


    def test_clear_rooms(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.clear_rooms()
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Room.objects.exists())


    def room_users(self, roomId):
        """
        test the api
        """
        payload = {
            'roomId': roomId,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.get('/api/room_users', data=payload_remove_none,
                                content_type="application/json")


    def test_room_users(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.room_users(1)
        self.assertEqual(response.status_code, 200)


    def test_room_users_wrong(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.room_users(2)
        self.assertEqual(response.status_code, 400)


    def check_room(self, username, roomId):
        """
        test api
        """
        payload = {
            'username': username,
            'roomId': roomId,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]
        return self.client.post('/api/check_room', data=payload_remove_none,
                                    content_type="application/json")


    def test_check_room1(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.check_room('Alice', 1)
        self.assertEqual(response.status_code, 400)


    def test_check_room2(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.check_room('Bob', 1)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf-8'))['data']
        self.assertEqual(data, 'host')


    def test_check_room3(self):
        """
        test function
        """
        self.test_room_create_success()
        self.room_join('Bob', 1, 'host')
        response = self.check_room('Alice', 1)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf-8'))['data']
        self.assertEqual(data, 'audience')


    def test_check_room4(self):
        """
        test function
        """
        self.test_room_create_success()
        response = self.check_room('Eve', 1)
        self.assertEqual(response.status_code, 400)


    def test_check_room5(self):
        """
        test function
        """
        self.test_room_create_success()
        self.room_join('Bob', 1, 'host')
        response = self.check_room('Frank', 1)
        self.assertEqual(response.status_code, 400)


    def test_check_room6(self):
        """
        test function
        """
        self.test_room_create_success()
        self.room_join('Bob', 1, 'host')
        response = self.check_room('Candy', 1)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf-8'))['data']
        self.assertEqual(data, 'guest')


    def test_check_room7(self):
        """
        test function
        """
        self.test_room_create_success()
        self.room_join('Bob', 2, 'host')
        response = self.check_room('Candy', 1)
        self.assertEqual(response.status_code, 400)


    def update_room_list(self, roomId, userList):
        """
        test api
        """
        userlist = [{'username': x,
                    'isAllowToSpeak': False,
                    'isMicrophoneOn': False,
                    'isApply': False,
                    'isLive': False,
                    } for x in userList]
        payload = {
            'roomId': roomId,
            'userList': userlist,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        return self.client.post('/api/update_room_list', data=payload_remove_none,
                                    content_type="application/json")


    def test_update_room_list(self):
        """
        test function
        """
        self.test_room_join_success()
        ulist = ['Bob', 'Candy']
        response = self.update_room_list(1, ulist)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Room.objects.get(roomId=1).activeUserList.
                            get(username='Bob').isApply)

        response = self.update_room_list(2, ulist)
        self.assertEqual(response.status_code, 400)


    def kick_out_room(self, roomId, username):
        """
        test api
        """
        payload = {
            'roomId': roomId,
            'username': username,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        return self.client.post('/api/kick_out_room', data=payload_remove_none,
                                    content_type="application/json")


    def test_kick_out_room(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.kick_out_room(1, 'Candy')
        self.assertEqual(response.status_code, 200)


    def test_kick_out_room2(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.kick_out_room(2, 'Candy')
        self.assertEqual(response.status_code, 400)


    def test_kick_out_room3(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.kick_out_room(1, 'Eve')
        self.assertEqual(response.status_code, 400)


    def be_host(self, roomId, username):
        """
        test api
        """
        payload = {
            'roomId': roomId,
            'username': username,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        return self.client.post('/api/be_host', data=payload_remove_none,
                                    content_type="application/json")


    def test_be_host(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.be_host(1, 'Eve')
        self.assertEqual(response.status_code, 400)
        response = self.be_host(2, 'Alice')
        self.assertEqual(response.status_code, 400)


    def be_audience(self, roomId, username):
        """
        test api
        """
        payload = {
            'roomId': roomId,
            'username': username,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        return self.client.post('/api/be_audience', data=payload_remove_none,
                                content_type="application/json")


    def test_be_audience(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.be_audience(1, 'Eve')
        self.assertEqual(response.status_code, 400)
        response = self.be_audience(2, 'Alice')
        self.assertEqual(response.status_code, 400)


    def shut_up_user(self, roomId, username):
        """
        test api
        """
        payload = {
            'roomId': roomId,
            'username': username,
        }
        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        return self.client.post('/api/shut_up_user', data=payload_remove_none,
                                    content_type="application/json")


    def test_shut_up_user(self):
        """
        test function
        """
        self.test_room_join_success()
        response = self.shut_up_user(1, 'Eve')
        self.assertEqual(response.status_code, 400)
        response = self.shut_up_user(2, 'Alice')
        self.assertEqual(response.status_code, 400)
