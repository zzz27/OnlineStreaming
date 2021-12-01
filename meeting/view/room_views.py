"""Room Views"""

import json
from operator import ge
from django.core.exceptions import ValidationError
from utils.send_socket import send_user_list, send_like_number, send_message, send_exit_room, send_shut_up, send_be_host, send_be_audience
from utils.utils import gen_response, get_token, clients
from ..models import User, Room, Messages

def create_room(request):
    """For the admin to create a new room.
    Args:
    ----------------------------------
    request: json POST
        {
            username: str,
            streamer: str,
            roomName: str,
            isPrivate: bool,
            permitUserList: array(str),
            guestList: array(str),
            type: 'core' or 'elective'
        }
    Returns:
    ----------------------------------
    reponse: JsonResponse
        code 200: successfully join in the room
        code 400: Fail to join in
    """
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        creatorName = body['username']
        streamerName = body['streamer']
        roomName = body['roomName']
        isPrivate = body['isPrivate']
        permitUserList = body['permitUserList']
        guestList = body['guestList']
        type = body['type']
        # find the user in db
        creator = User.objects.filter(username=creatorName).first()
        streamer = User.objects.filter(username=streamerName).first()
        if not creator:  # the streamer does not exist
            return gen_response(400, "the creator not exists")
        if not streamer:
            return gen_response(400, "the streamer not exists")
        if not creator.isAdmin:  # check the admin auth
            return gen_response(400, "The user is not admin.")
        if streamerName not in [x['username'] for x in permitUserList] and isPrivate is True:
            return gen_response(400, "The streamer is not in audienceList.")

        for item in guestList:
            name = item['username']
            if name not in [x['username'] for x in permitUserList]:
                return gen_response(400, f"the guest * {name} * is not in audienceList.")

        # create the room
        room = Room(roomName=roomName, isPrivate=isPrivate, streamer=streamer)
        room.type = type
        room.save()
        for username in [x['username'] for x in permitUserList]:  # add the permitted users
            user = User.objects.filter(username=username).first()
            if not user:  # the user does not exist
                return gen_response(400, f"the user * {username} * does not exist.")
            room.permitUserList.add(user)

        for username in [x['username'] for x in guestList]:  # add the permitted users
            user = User.objects.filter(username=username).first()
            room.guestList.add(user)
        room.save()
        return gen_response(200, "Room created successfully!")
    # the method is invalid
    return gen_response(400, f'Method {request.method} not allowd')


def join_room(request):
    """Change the database to join a room.
    Args:
    ----------------------------------
    request: json
        The request post from front-end.

    Return:
    ----------------------------------
    response: JsonResponse
        code 200: successfully join in the room
        code 400: Fail to join in

    """

    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        roomId = body['roomId']
        role = body['role']
        isTest = body['testFlag'] if 'testFlag' in body.keys() else False
        user = User.objects.filter(username=username).first()
        room = Room.objects.filter(roomId=roomId).first()
        if not user:  # the user not exist
            return gen_response(400, "the user not exists")
        if not user.onlineStatus:  # the user is offline
            return gen_response(400, "the user not online.")
        #if user.role is not None:
        if user.role != "None":
            # the user has role, suggesting the user is in another room currently.
            return gen_response(400, "one user could not be in two rooms simultaneously.")
        if not room:  # the room not exist, return false!
            return gen_response(400, 'The room does not exist!')
        # the room exists, join room!
        if room.isPrivate:  # the room is private, need to check.
            queryResult = room.permitUserList.filter(username=user.username)
            if not queryResult:  # the user is not allowed to this room
                return gen_response(400, "Sorry, this user has no permission to this room.")
        if room.currentStreamer is None:  # the room does not have streamer.
            if room.streamer.username != username and user.isAdmin is False:
                # the user is not streamer
                return gen_response(400, "Please wait for the streamer to join.")
            user.role = role
            user.isMicrophoneOn = True
            user.isAllowToSpeak = True
            user.isApply = False
            user.isLive = True
            user.save()
            room.activeUserList.add(user)
            if room.streamer.username == username:  # join as streamer, change the room
                room.currentStreamer = user
            room.save()
            send_user_list(clients, room)
            send_like_number(clients, room)
            if isTest:
                return gen_response(200, {})
            else:
                return get_token(roomId, uid=0, Role_Attendee = 1 if role == 'host' else 2)

        # the room has streamer
        if role == "host":  # the user should not become the streamer, return failure.
            return gen_response(400, "The room already has streamer")

        if role == "audience" or role == "guest":
            room.activeUserList.add(user)
            room.save()
            user.role = role
            user.isMicrophoneOn = False
            user.isAllowToSpeak = False
            user.isApply = False
            user.isLive = False
            user.save()
            send_user_list(clients, room)
            send_like_number(clients, room)
            if isTest:
                return gen_response(200, {})
            else:
                return get_token(roomId, uid=0, Role_Attendee = 1 if role == 'host' else 2)
    # the method is invalid
    return gen_response(400, f'Method {request.method} not allowd')


def edit_room(request):
    """Edit the existed room.
    Args:
    ----------------------------------
    request: json POST
    {
        ------ # ToCheckInfo
        username: str,
        roomID: int,

        ------ # ToChangeInfo
        roomName: str,
        isPrivate: bool,
        audienceList: array(str)
    }
    The request post from front-end.
    Return:
    ----------------------------------
    response: JsonResponse
        code 200: successfully edit the room
        code 400: Edit error.
    """
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        streamerName = body['streamer']
        roomId = body['roomId']
        roomName = body['roomName']
        isPrivate = body['isPrivate']
        permitUserList = body['permitUserList']
        guestList = body['guestList']
        type = body['type']
        # check if the user is admin
        user = User.objects.filter(username=username).first()
        streamer = User.objects.filter(username=streamerName).first()
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist!")
        if not streamer:
            return gen_response(400, "the streamer not exists!")

        if not user.isAdmin:  # the user is not admin, has no auth to edit the room
            return gen_response(400, "No auth to edit!")
        if streamerName not in [x['username'] for x in permitUserList] and isPrivate is True:
            return gen_response(400, "The streamer is not in audienceList.")

        for item in guestList:
            name = item['username']
            if name not in [x['username'] for x in permitUserList]:
                return gen_response(400, f"the guest * {name} * is not in audienceList.")

        # check if the room exists
        room = Room.objects.filter(roomId=roomId).first()

        if not room:  # the room does not exist
            return gen_response(400, "The room does not exist, please create first!")
        # the auth is correct, now edit!
        try:
            room.roomName = roomName
            room.isPrivate = isPrivate
            room.streamer = streamer
            room.type = type

            room.permitUserList.clear()
            for item in permitUserList:  # add the permitted users
                name = item['username']
                tUser = User.objects.filter(username=name).first()
                if not tUser:  # the user does not exist
                    return gen_response(400, f"the user * {name} * does not exist!")
                room.permitUserList.add(tUser)

            room.guestList.clear()
            for item in guestList:  # add the permitted users
                name = item['username']
                tUser = User.objects.filter(username=name).first()
                if not tUser:  # the user does not exist
                    return gen_response(400, f"the user * {name} * does not exist!")
                room.guestList.add(tUser)

        except:
            return gen_response(400, "Edit error.")
        room.save()
        return gen_response(200, "Edit room successfully!")

    # the method is not POST
    return gen_response(400, f'Method {request.method} not allowd')


def exit_room(request):
    """Change the database to exit the room.
    Args:
    ----------------------------------
    request: json
        The request post from front-end.

    Return:
    ----------------------------------
    response: JsonResponse
        code 200: successfully exit the room
        code 400: Fail to exit

    """
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        roomId = body['roomId']
        user = User.objects.filter(username=username).first()
        room = Room.objects.filter(roomId=roomId).first()
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist.")
        if not room:  # the room does not exist
            return gen_response(400, "The room does not exist.")
        tUser = room.activeUserList.all().filter(username=username).first()
        if not tUser:  # the user is not in this room
            return gen_response(400, f"The user {username} is not in this room {roomId}.")
        # exit
        room.activeUserList.remove(tUser)
        tUser.role = "None"
        tUser.save()
        if room.currentStreamer == user:  # if the streamer is the user, clear the currentStreamer
            room.currentStreamer = None
        room.save()
        send_user_list(clients, room)
        return gen_response(200, "Exit room successfully!")
     # the method is invalid
    return gen_response(400, f'Method {request.method} not allowd')


def delete_room(request):
    """To delete the room
    Args:
    ----------------------------------
    request: json
        The request post from front-end.

    Return:
    ----------------------------------
    response: JsonResponse
        code 200: successfully delete the room
        code 400: Fail to exit

    """
    if request.method == 'POST':  # the method is correct
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        roomId = body['roomId']
        user = User.objects.filter(username=username).first()
        # feasibility check
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist.")
        if not user.isAdmin:  # the user has no auth to delete the room
            return gen_response(400, "You are not admin, have no auth to delete the room.")
        room = Room.objects.filter(roomId=roomId).first()
        if not room:  # the room does not exist
            return gen_response(400, "The room does not exist.")
        # delete the room
        for tUser in room.activeUserList.all():  # deal with the users in the room
            tUser.role = "None"
            tUser.save()
        Room.objects.filter(roomId=roomId).delete()
        return gen_response(200, "Delete room successfully!")

    # the method is not correct
    return gen_response(400, f'Method {request.method} not allowd')


def get_user_room(request):
    """Return all the related room of the current user.
    Args:
    ----------------------------------
    request: json POST {
        username: str,
    }
        The request post from front-end.

    Return:
    ----------------------------------
    response: JsonResponse
        code 200: successfully delete the room
        code 400: Fail to exit

    """
    if request.method == 'POST':
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        getType = body['getType']
        user = User.objects.filter(username=username).first()
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist.")
        queryResult = []
        # query the room that permits this user
        for room in Room.objects.all():
            tUser = room.permitUserList.filter(username=username).first()
            if tUser or room.isPrivate is False or getType == "manage":  # the user is in this room
                messages_return=""
                for msg in room.historyRecord.all():
                    messages_return=messages_return+msg.sender+"("+msg.pubTime.strftime("%Y-%m-%d")+")\n\t:"+msg.content+"\n"
                queryResult.append({
                    'roomId': room.roomId,
                    'roomName': room.roomName,
                    'likeNumber': room.likeNumber,
                    'isPrivate': room.isPrivate,
                    'streamer': room.streamer.username,
                    'state': ("ON" if room.currentStreamer is not None else "OFF"),
                    'type' : room.type if (tUser or getType == "manage") else "others",
                    'isGuest' : True if (room.streamer.username != username and
                    username in [x.username for x in room.guestList.all()]) else False,
                    'permitUserList': [
                        {
                            "username" : x.username
                        }
                        for x in room.permitUserList.all()
                    ],
                    'historyRecord' : messages_return,
                    'guestList': [
                        {
                            "username" : x.username
                        }
                        for x in room.guestList.all()
                    ],
                })
        return gen_response(200, queryResult)

    # the method is incorrect
    return gen_response(400, f'Method {request.method} not allowd')

def clear_chatroom_record(request):
    """
        clear room chat room record.
        Args:
        -----------------------------
        request: json
    """
    if request.method =="POST":
        body = json.loads(request.body.decode('utf-8'))
        roomId=body['roomId']
        room = Room.objects.filter(roomId=roomId).first()
        room.historyRecord.all().delete()
        return gen_response(200,"clear_successfully")

def thumb_up_room(request):
    """
    Thumb up a Room
    """
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        room = Room.objects.filter(roomId=roomId).first()
        if not room:
            return gen_response(400, "the room not exists.")
        room.likeNumber = room.likeNumber + 1
        room.save()
        send_like_number(clients, room)
        return gen_response(200, "Thumb up successfully!")
    # the method is invalid
    return gen_response(400, f'Method {request.method} not allowd')


def send_chat(request):
    """
        Send message from a user to other users
    """
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        content = body['content']
        tarUser = body['targetUser']
        sorUser = body['sourceUser']
        istest=False
        if 'istest' in body:
            istest=True

        room = Room.objects.filter(roomId=roomId).first()
        if content == "":
            return gen_response(400, "no message needs to be sent.")
        if not room:
            return gen_response(400, "the room not exists.")
        messa=Messages(content=content,sender=sorUser,reciever=tarUser)
        try:
            messa.full_clean()
            messa.save()
        except ValidationError:
            return gen_response(400, "Validation Error of message")
        if tarUser=="To All":
            room.historyRecord.add(messa)
            room.save()
        if not istest:
            send_message(clients, room, sorUser, tarUser, content)
        return gen_response(200, "Send messages successfully!")

    # the method is invalid
    return gen_response(400, f'Method {request.method} not allowd')


def all_rooms(request):
    """
    Get all rooms information
    """
    if request.method == "GET":
        return gen_response(200, [
                    {
                        'roomId': msg.roomId,
                        'roomName': msg.roomName,
                        'likeNumber': msg.likeNumber,
                        'isPrivate': msg.isPrivate,
                        'streamer':
                            (msg.streamer.username if
                            msg.streamer is not None else "None"),
                        'currentStreamer':
                            (msg.currentStreamer.username if
                            msg.currentStreamer is not None else "None"),
                        'activeUserList':
                            [x.username for x in msg.activeUserList.all()],
                        'permitUserList':
                            [x.username for x in msg.permitUserList.all()],
                        'guestList':
                            [x.username for x in msg.guestList.all()],
                        'type' : msg.type
                    }
                    for msg in Room.objects.all()
                ])

    return gen_response(400, f'Method {request.method} not allowd')


def one_room(request):
    """
    Get one rooms information
    """
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        room = Room.objects.filter(roomId=roomId).first()
        return gen_response(200, [
                {
                    'roomId': room.roomId,
                    'roomName': room.roomName,
                    'likeNumber' : room.likeNumber,
                    'isPrivate' : room.isPrivate,
                    'streamer' :
                        room.streamer.username if room.streamer is not None else "None",
                    'currentStreamer' :
                        room.currentStreamer.username 
                        if room.currentStreamer is not None else "None",
                    'activeUserList' :
                        [x.username for x in room.activeUserList.all()],
                    'permitUserList' :
                        [x.username for x in room.permitUserList.all()],
                    'guestUserList':
                        [x.username for x in room.guestList.all()]
                }
            ])
    return gen_response(400, f'Method {request.method} not allowd')


def clear_rooms(request):
    """
    Clear all rooms information
    """
    if request.method == "GET":
        Room.objects.all().delete()
        return gen_response(200, "Rooms was cleared successfully!")
    return gen_response(400, f'Method {request.method} not allowd')


def room_users(request):
    """
    Get user information in the room
    """
    if request.method == "GET":
        roomId = request.GET.get("roomId")
        room = Room.objects.filter(roomId=roomId).first()
        if not room:  # the room does not exist
            return gen_response(400, "The room does not exist.")
        return gen_response(200, [
                {
                    'username': msg.username,
                    'password': msg.password,
                    'online_status': msg.onlineStatus,
                    'role': msg.role
                }
                for msg in room.activeUserList.all()
            ])
    return gen_response(400, f'Method {request.method} not allowd')


def check_room(request):
    """check whether the user can enter the room"""
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        roomId = body['roomId']
        user = User.objects.filter(username=username).first()
        room = Room.objects.filter(roomId=roomId).first()
        if not user:  # the user not exist
            return gen_response(400, "the user not exists")
        if not room:  # the room not exist, return false!
            return gen_response(400, 'The room does not exist!')
        if room.streamer.username != username and room.currentStreamer is None:
            return gen_response(400, 'The live broadcast has not started!')
        if (room.isPrivate is True) and (user.isAdmin is False) and (username not in [x.username 
            for x in room.permitUserList.all()]):
            return gen_response(400, 'The room does not exist!')
        
        isHost = True if room.streamer.username == username else False
        isGuest = True if username in [x.username for x in room.guestList.all()] else False
        if isHost:
            return gen_response(200, 'host')
        if isGuest:
            return gen_response(200, 'guest')
        return gen_response(200, 'audience')
    return gen_response(400, f'Method {request.method} not allowd')


def update_room_list(request):
    """update_room_list"""
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        userStatusList = body['userList']
        room = Room.objects.filter(roomId=roomId).first()
        if not room:  # the room not exist, return false!
            return gen_response(400, 'The room does not exist!')
        for user in room.activeUserList.all():
            for item in userStatusList:
                if user.username == item['username']:
                    user.isAllowToSpeak = item['isAllowToSpeak']
                    user.isMicrophoneOn = item['isMicrophoneOn']
                    user.isApply = item['isApply']
                    user.isLive = item['isLive']
                    user.save()
        send_user_list(clients, room)
        return gen_response(200, 'Change room status successfully!')
    return gen_response(400, f'Method {request.method} not allowd!')


def kick_out_room(request):
    """kick_out_room"""
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        username = body['username']
        room = Room.objects.filter(roomId=roomId).first()
        user = User.objects.filter(username=username).first()
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist.")
        if not room:  # the room not exist, return false!
            return gen_response(400, 'The room does not exist!')
        send_exit_room(clients, user)
        return gen_response(200, 'Change room status successfully!')
    return gen_response(400, f'Method {request.method} not allowd!')


def token(request):
    """token"""
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        role = body['role']
        return get_token(roomId, uid=0, Role_Attendee = 1 if role == 'host' else 2)
    return gen_response(400, f'Method {request.method} not allowd!')


def be_host(request):
    """be_host"""
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        username = body['username']
        room = Room.objects.filter(roomId=roomId).first()
        user = User.objects.filter(username=username).first()
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist.")
        if not room:  # the room not exist, return false!
            return gen_response(400, 'The room does not exist!')
        send_be_host(clients, user, room)
        return gen_response(200, 'Change room status successfully!')
    return gen_response(400, f'Method {request.method} not allowd!')


def be_audience(request):
    """be_audience"""
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        username = body['username']
        room = Room.objects.filter(roomId=roomId).first()
        user = User.objects.filter(username=username).first()
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist.")
        if not room:  # the room not exist, return false!
            return gen_response(400, 'The room does not exist!')
        send_be_audience(clients, user, room)
        return gen_response(200, 'Change room status successfully!')
    return gen_response(400, f'Method {request.method} not allowd!')


def shut_up_user(request):
    """shut_up_user"""
    if request.method == "POST":  # check the method is valid
        body = json.loads(request.body.decode('utf-8'))
        roomId = body['roomId']
        username = body['username']
        room = Room.objects.filter(roomId=roomId).first()
        user = User.objects.filter(username=username).first()
        if not user:  # the user does not exist
            return gen_response(400, "The user does not exist.")
        if not room:  # the room not exist, return false!
            return gen_response(400, 'The room does not exist!')
        send_shut_up(clients, user)
        return gen_response(200, 'Change room status successfully!')
    return gen_response(400, f'Method {request.method} not allowd!')
