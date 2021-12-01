'''
meeting URL Configuration
'''
from django.urls import path

from .view import room_views, user_views, socket_views

urlpatterns = [
    
    # user views
    path('register', user_views.register, name='register'),
    path('login', user_views.login, name='login'),
    path('logout', user_views.logout, name='logout'),

    path('all_users', user_views.all_users, name='all_users'),
    path('all_users_name', user_views.all_users_name, name='all_users_name'),
    path('clear_users', user_views.clear_users, name='clear_users'),

    # room views
    path('create_room', room_views.create_room, name='create_room'),
    path('join_room', room_views.join_room, name='join_room'),
    path('edit_room', room_views.edit_room, name='edit_room'),
    path('exit_room', room_views.exit_room, name='exit_room'),
    path('check_room', room_views.check_room, name='check_room'),
    path('thumb_up', room_views.thumb_up_room, name="thumb_up_room"),

    path('send_message',room_views.send_chat, name="send_message"),
    path('delete_room', room_views.delete_room, name="delete_room"),
    path('get_user_room', room_views.get_user_room, name="get_user_room"),
    path('update_room_list', room_views.update_room_list, name="update_room_list"),
    path('kick_out_room', room_views.kick_out_room, name="kick_out_room"),
    path('token', room_views.token, name="token"),
    path('shut_up_user', room_views.shut_up_user, name="shut_up_user"),
    path('be_host', room_views.be_host, name="be_host"),
    path('be_audience', room_views.be_audience, name="be_audience"),

    path('all_rooms', room_views.all_rooms, name='all_rooms'),
    path('one_room', room_views.one_room, name='one_room'),
    path('clear_rooms', room_views.clear_rooms, name='clear_rooms'),
    path('room_users', room_views.room_users, name='room_users'),
    path('clear_chatroom_record',room_views.clear_chatroom_record,name="clear_chatroom_record"),

    # Web Socket
    path('accept_socket', socket_views.accept_socket, name="accept_socket"),
    path('close_socket', socket_views.close_socket, name="close_socket"),
]
