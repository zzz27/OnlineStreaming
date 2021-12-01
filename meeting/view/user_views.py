"""User Views."""

import json

from utils.utils import gen_response, check_username
from ..models import User


def register(request):
    """Change the database to register.

    Check: if the username has not been registered
    If valid message, register the user with username and password.

    Args:
    ----------------------------
    request: json
        The request post sent from front-end.
    Return:
    ----------------------------
    response: JsonResponse
        code 200: Register successfully
        code 400: Fail to register
    """
    # check the method to be valid
    if request.method == "POST":
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        password = body['password']
        print(username, password)
        user = User.objects.filter(username=username).first()  # find the username in the database.
        if not user:  # the username has not been registered
            try:
                assert check_username(username)
                user = User(username=username,
                            password=password,
                            onlineStatus=False,
                            role="None")
                user.full_clean()
                user.save()
            except:
                return gen_response(400, "Validation Error of user register!")
        else:  # the username has been registered
            return gen_response(400, "The user has been registered!")
    else:  # the request method is not 'POST', invalid
        return gen_response(400, f'Method {request.method} not allowd!')
    # Successfully register
    return gen_response(200, "Succeed register!")


def login(request):
    """Change the database to Log In.

    Check:
        - if the user exists,
        - if the password is correct
        - if the user is admin
    If valid message, change the online status of current user.
    Args:
    ----------------------------------
    request: json
        The request post from front-end.
    Return:
    ----------------------------------
    response: JsonResponse
        code 200: successfully log in
        code 400: Fail to log in

    TODO:
    ----------------------------------
    - To examine the security problem
    - To examine the illegal case
        Example:
            The user has logged in, and there is another logging in request.
    - To add the admin check
    - To add the data return
    """
    # check the method is valid
    if request.method == "POST":
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        user = User.objects.filter(username=username).first()  # find the username in the database.
        if not user:  # the username has not been registered
            return gen_response(400, "The user has not been registered!")
        # if not check_username(username):  # the name does not pass the reg
        #     return gen_response(400, "Wrong validation of user name!")
        # the username is valid
        password = body['password']
        if password == user.password:  # the pwd is correct
            #if(user.onlineStatus is True):
            #    return gen_response(400, "The user is already online!")
            user.onlineStatus = True
            user.save()
            if user.isAdmin:  # this user is admin, return the admin-data
                return gen_response(200, {"username": username, "isAdmin": True})
            # return the regular data
            return gen_response(200, {"username": username, "isAdmin": False})
        # the pwd is wrong
        return gen_response(400, "The password is wrong!")
    # the method is not "POST"
    return gen_response(400, f'Method {request.method} not allowd!')


def logout(request):
    """Change the database to log out.
    Check:
        - if the user exists,
        - if the user is online
    If valid message, change the online status of current user.
    Args:
    ----------------------------------
    request: json
        The request post from front-end.
    Return:
    ----------------------------------
    response: JsonResponse
        code 200: successfully log in
        code 400: Fail to log in
    TODO:
    ----------------------------------
    - To examine the security problem
    - To examine the illegal case
    """
    # check the method is valid
    if request.method == "POST":
        body = json.loads(request.body.decode('utf-8'))
        username = body['username']
        user = User.objects.filter(username=username).first()  # find the username in the database.
        if not user:  # the username has not been registered
            return gen_response(400, "The user has not been registered.")
        # the user exists
        if not user.onlineStatus:  # the user is offline
            return gen_response(400, "The user is offline.")
        # the user is online
        user.onlineStatus = False
        user.save()
        return gen_response(200, "Log out successfully!")
    # the method is not "POST"
    return gen_response(400, f'Method {request.method} not allowd')


def all_users(request):
    """
    Get all users information
    """
    if request.method == 'GET':
        return gen_response(200, [
                    {
                        'username': msg.username,
                        'password': msg.password,
                        'onlineStatus': msg.onlineStatus,
                        'role': msg.role,
                        'isAdmin':msg.isAdmin
                    }
                    for msg in User.objects.all()
                ])
    return gen_response(400, f'Method {request.method} not allowd')


def all_users_name(request):
    """
    Get all users information
    """
    if request.method == "GET":
        return gen_response(200, [
                    {
                        'username': msg.username,
                    }
                    for msg in User.objects.all()
                ])
    return gen_response(400, f'Method {request.method} not allowd')


def clear_users(request):
    """
    Clear all users information
    """
    if request.method == "GET":
        User.objects.all().delete()
        return gen_response(200, "Users was cleared successfully!")
    return gen_response(400, f'Method {request.method} not allowd')
