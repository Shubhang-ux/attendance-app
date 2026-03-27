"""
Account Views (API Endpoints)
==============================
Views are where the business logic lives. Each view:
  1. Receives an HTTP request
  2. Does something (validate, query DB, etc.)
  3. Returns an HTTP response (usually JSON)

DRF VIEW TYPES:
  - APIView: Base class, you write get(), post(), etc. manually
  - GenericAPIView: Adds queryset/serializer shortcuts
  - ViewSet: Groups related views (list, create, retrieve, update, delete)

We use APIView here because auth endpoints are simple and
it's easier to understand what's happening step by step.

HTTP METHODS:
  POST   = Create something (login, register)
  GET    = Read something (profile)
  PUT    = Update something (edit profile)
  DELETE = Delete something (not used here)

STATUS CODES:
  200 = OK (success)
  201 = Created (new resource made)
  400 = Bad Request (invalid data)
  401 = Unauthorized (not logged in)
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


class RegisterView(APIView):
    """
    POST /api/accounts/register/
    
    Creates a new user account + employee profile.
    Returns an auth token so user is immediately logged in.
    
    permission_classes = [AllowAny]  ← Anyone can register
    (overrides the default IsAuthenticated from settings)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            # .save() calls serializer.create() which makes User + Profile
            user = serializer.save()

            # Create an auth token for this user
            # Token is like a "session key" - frontend stores it
            # and sends it with every future request
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Registration successful!'
            }, status=status.HTTP_201_CREATED)

        # If validation failed, return the errors
        # e.g., {"username": ["Username already exists."]}
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/accounts/login/
    
    Authenticates user with username + password.
    Returns an auth token on success.
    
    FLOW:
      1. Validate input (username + password present)
      2. authenticate() checks credentials against DB
      3. If valid → return token
      4. If invalid → return 401 error
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            # Django's authenticate() checks username/password
            # Returns User object if valid, None if invalid
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )

            if user:
                # get_or_create: Reuse existing token or make a new one
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'message': 'Login successful!'
                })
            else:
                return Response(
                    {'error': 'Invalid username or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/accounts/logout/
    
    Deletes the user's auth token, effectively logging them out.
    The frontend should also clear its stored token.
    
    request.user is automatically set by TokenAuthentication
    middleware when a valid token is sent in the header.
    """
    def post(self, request):
        # Delete the token → future requests with this token will fail
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})


class ProfileView(APIView):
    """
    GET  /api/accounts/profile/  → Get current user's profile
    PUT  /api/accounts/profile/  → Update profile
    
    request.user is auto-populated from the token in the header.
    No need to pass user ID - the API knows who you are!
    """
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        # Update User fields
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()

        # Update Profile fields
        profile = user.profile
        profile.department = request.data.get('department', profile.department)
        profile.designation = request.data.get('designation', profile.designation)
        profile.phone = request.data.get('phone', profile.phone)
        profile.save()

        return Response(UserSerializer(user).data)
