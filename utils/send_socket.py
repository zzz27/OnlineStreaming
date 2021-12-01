import json

USER_LIST_CODE = "1"
LIKE_NUMBER_CODE = "2"
ROOM_LIST_CODE = "3"
SEND_MESSAGE_CODE="4"
EXIT_ROOM_CODE = "5"
SHUT_UP_CODE = "6"
BE_HOST = "7"
BE_AUDIENCE = "8"


def send_user_list(clients, room):
    userList = [{
                    "username": msg.username,
                    "role": msg.role,
                    "isAllowToSpeak": msg.isAllowToSpeak,
                    "isMicrophoneOn": msg.isMicrophoneOn,
                    "isApply": msg.isApply,
                    "isLive": msg.isLive,
                    "isAdmin": True if (msg.isAdmin is True) else False 
                }
                for msg in room.activeUserList.all()]
    message = {
        "code" : USER_LIST_CODE,
        "data" : userList
    }
    message = json.dumps(message)
    for key in clients.keys():
        name = key[:-8]
        for x in userList:
            if x['username'] == name:
                clients[key].send(message)


def send_like_number(clients, room):
    userList = [{
                    "username": msg.username
                }
                for msg in room.activeUserList.all()]
    number = room.likeNumber
    message = {
        "code" : LIKE_NUMBER_CODE,
        "data" : number
    }
    message = json.dumps(message)
    for key in clients.keys():
        name = key[:-8]
        for x in userList:
            if x['username'] == name:
                clients[key].send(message)


def send_message(clients, room, sorUser, tarUser, content):
    UserList = [
        {
            "username": msg.username
        }
    for msg in room.activeUserList.all()]
    type = "(Private)"
    if(tarUser == "To All"):
        type = "(Public)"
    appendMessage = {
        'sender': sorUser,
        'type': type,
        'content': content
    }
    message = {
        "code" : SEND_MESSAGE_CODE,
        'sender': sorUser,
        'type': type,
        'content': content
    }
    message = json.dumps(message)
    if tarUser == "To All":
        print(tarUser)
        for key in clients.keys():
            print(key)
            name = key[:-8]
            for x in UserList:
                print(" " + x["username"])
                if x['username'] == name:
                    print(key)
                    clients[key].send(message)
    else:
        for x in UserList:
            if x['username'] == tarUser or x['username'] == sorUser:
                clients[x['username'] + "_meeting"].send(message)


def send_exit_room(clients, user):
    message = {
        "code" : EXIT_ROOM_CODE,
    }
    message = json.dumps(message)
    for key in clients.keys():
        name = key[:-8]
        if user.username == name:
            clients[key].send(message)


def send_shut_up(clients, user):
    message = {
        "code" : SHUT_UP_CODE,
    }
    message = json.dumps(message)
    for key in clients.keys():
        name = key[:-8]
        if user.username == name:
            clients[key].send(message)


def send_be_host(clients, user, room):
    message = {
        "code" : BE_HOST,
        "streamer" : room.streamer.username,
    }
    message = json.dumps(message)
    for key in clients.keys():
        name = key[:-8]
        if user.username == name:
            clients[key].send(message)


def send_be_audience(clients, user, room):
    message = {
        "code" : BE_AUDIENCE,
        "streamer" : room.streamer.username,
    }
    message = json.dumps(message)
    for key in clients.keys():
        name = key[:-8]
        if user.username == name:
            clients[key].send(message)
