import os

from .settings import *
from .settings import BASE_DIR

ALLOWED_HOSTS = [os.environ.get('WEBSITE_HOSTNAME', 'localhost')]
CSRF_TRUSTED_ORIGINS = [f"https://{os.environ.get('WEBSITE_HOSTNAME', 'localhost')}"]
DEBUG = False
SECRET_KEY = os.environ['MY_SECRET_KEY']

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS_ALLOWED_ORIGINS = [
#     
# ]

STORAGES = {
    'default': {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    'staticfiles':{
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    }
}

CONNECTION = os.environ['AZURE_MYSQL_CONNECTIONSTRING']
CONNECTION_STR = {
    pair.split('=')[0]: pair.split('=')[1] for pair in CONNECTION.split(' ')
}
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': CONNECTION_STR['database'],
        'HOST': CONNECTION_STR['host'],
        'USER': CONNECTION_STR['user'],
        'PASSWORD': CONNECTION_STR['password'],
    }
}

STATIC_ROOT = BASE_DIR/'staticfiles'