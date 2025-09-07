import os

from .settings import *
from .settings import BASE_DIR

ALLOWED_HOSTS = [os.environ['WEBSITE_HOSTNAME']]
CSRF_TRUSTED_ORIGINS = ['https://'+os.environ['WEBSITE_HOSTNAME']]
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

# CONNECTION = os.environ['AZURE_MYSQL_CONNECTIONSTRING']
# CONNECTION_STR = {
#     pair.split('=')[0]: pair.split('=')[1] for pair in CONNECTION.split(' ')
# }


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ["AZURE_MYSQL_NAME"],
        'HOST': os.environ["AZURE_MYSQL_HOST"],
        'USER': os.environ["AZURE_MYSQL_USER"],
        'PASSWORD': os.environ["AZURE_MYSQL_PASSWORD"],
        "OPTIONS": {
            "ssl": {"ca": "/etc/ssl/certs/ca-certificates.crt"}
        },
    }
}

STATIC_ROOT = BASE_DIR/'staticfiles'