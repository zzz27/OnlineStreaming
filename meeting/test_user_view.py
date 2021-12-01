"""
This module provides the test code of the user view.
"""

from django.test import TestCase
from .models import User

class TestUser(TestCase):
    """
    This class provides the test module.
    """
    def setUp(self):
        """
        setUp: Run once for every test method to setup clean data.
        """
        User.objects.create(username='Alice', password='alice', onlineStatus=True, isAdmin=True)
        User.objects.create(username='Bob', password='bob', onlineStatus=False, isAdmin=False)
        User.objects.create(username='Candy', password='candy', onlineStatus=False, isAdmin=False)

    def user_register(self, username, password, isGet=False):
        """
            register the user in test modules
        """
        payload = {
            'username': username,
            'password': password
        }

        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        if isGet:
            return self.client.get('/api/register', data=payload_remove_none,
            content_type="application/json")

        return self.client.post('/api/register', data=payload_remove_none,
            content_type="application/json")

    def test_user_register_repeat(self):
        """
            test1
        """
        response = self.user_register('Alice', 'aaa')
        self.assertEqual(response.status_code, 400)
        response = self.user_register('Bb', 'bbb')
        self.assertEqual(response.status_code, 400)
        response = self.user_register('Alice1', 'aaa11', True)
        self.assertEqual(response.status_code, 400)

    def test_user_register_success(self):
        """
            test2
        """
        response = self.user_register("David", 'david')
        self.assertEqual(response.status_code, 200)

    def user_login(self, username, password, isGet=False):
        """
            user login
        """
        payload = {
            'username': username,
            'password': password
        }

        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        if isGet:
            return self.client.get('/api/login', data=payload_remove_none,
            content_type="application/json")

        return self.client.post('/api/login', data=payload_remove_none,
            content_type="application/json")

    def test_user_login_not_exist(self):
        """
            test3
        """
        response = self.user_login('David', 'david')
        self.assertEqual(response.status_code, 400)

    def test_user_login_wrong_password(self):
        """
            test4
        """
        response = self.user_login('Bob', 'bbb')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username='Bob').first().onlineStatus)

    # def test_user_login_repeat_login(self):
    #     response = self.user_login('Alice', 'alice')
    #     self.assertEqual(response.status_code, 400)

    def test_user_login_success(self):
        """
            test5
        """
        response = self.user_login('Bob', 'bob')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(username='Bob').first().onlineStatus)

        response = self.user_login('Alice', 'alice')
        self.assertEqual(response.status_code, 200)

        response = self.user_login('Alice', 'alice', True)
        self.assertEqual(response.status_code, 400)

    def user_logout(self, username, isGet=False):
        """
            user logout
        """
        payload = {
            'username': username,
        }

        payload_remove_none = {}
        for i in payload:
            if payload[i] is not None:
                payload_remove_none[i] = payload[i]

        if isGet: 
            return self.client.get('/api/logout', data=payload_remove_none,
            content_type="application/json")

        return self.client.post('/api/logout', data=payload_remove_none,
            content_type="application/json")

    def test_user_logout_success(self):
        """
            test6
        """
        response = self.user_logout('Alice')
        self.assertEqual(response.status_code, 200)

        response = self.user_logout('Alice', True)
        self.assertEqual(response.status_code, 400)

    def test_user_logout_fail(self):
        """
            test7
        """
        response = self.user_logout('Bob')
        self.assertEqual(response.status_code, 400)
        response = self.user_logout('David')
        self.assertEqual(response.status_code, 400)


    def all_users(self):
        """
        test the api
        """
        return self.client.get('/api/all_users')

    def all_users_bad(self):
        """
        test the api
        """
        return self.client.post('/api/all_users')

    def test_all_users(self):
        """
        test function
        """
        self.test_user_login_success()
        response = self.all_users()
        self.assertEqual(response.status_code, 200)

    def test_all_users_fail(self):
        """
        test function
        """
        self.test_user_login_success()
        response = self.all_users_bad()
        self.assertEqual(response.status_code, 400)


    def all_users_name(self):
        """
        test the api
        """
        return self.client.get('/api/all_users_name')

    def all_users_name_bad(self):
        """
        test the api
        """
        return self.client.post('/api/all_users_name')

    def test_all_users_name(self):
        """
        test function
        """
        response = self.all_users_name()
        self.assertEqual(response.status_code, 200)
        response = self.all_users_name_bad()
        self.assertEqual(response.status_code, 400)


    def clear_users(self):
        """
        test the api
        """
        return self.client.get('/api/clear_users')

    def clear_users_bad(self):
        """
        test the api
        """
        return self.client.post('/api/clear_users')

    def test_clear_users(self):
        """
        test function
        """
        response = self.clear_users()
        self.assertEqual(response.status_code, 200)
        response = self.clear_users_bad()
        self.assertEqual(response.status_code, 400)
    