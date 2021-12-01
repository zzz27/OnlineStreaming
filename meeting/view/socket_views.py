"""websocket Views

"""
import json
from utils.utils import gen_response, clients
from dwebsocket.decorators import accept_websocket


# WebSocket

@accept_websocket
def accept_socket(request):
    """
    Accept websocket connection
    """
    if request.is_websocket():
        while True:
            message = request.websocket.wait()
            if not message:
                break
            roomId = str(message, encoding = "utf-8")
            print("客户端链接成功：" + roomId)
            clients[roomId] = request.websocket
            print(clients.keys())


def close_socket(request):
    """
    Close websocket connection
    """
    if request.method == "POST":
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        clients[username].close()
        clients.pop(username)
        print("客户端删除成功：" + username)
        print(clients.keys())
        return gen_response(200, "WebSocket is closed!")
    return gen_response(400, f'method {request.method} not allowd')
