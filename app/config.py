import os

allowed_extensions = {'mp3'}

environment = os.getenv('FLASK_ENV')
schema = os.environ.get('SCHEMA')
SCHEMA = os.environ.get('SCHEMA')

bucket_name = os.environ.get('S3_BUCKET')
s3_region = os.environ.get('S3_REGION')
s3_server_url = f'https://{bucket_name}.s3.{s3_region}.amazonaws.com'
S3_KEY = os.environ.get("S3_KEY")
S3_SECRET = os.environ.get("S3_SECRET")

if environment == 'production' or environment == 'aws-testing':
    music_server_url = s3_server_url
else:
    music_server_url = 'http://localhost:5000'

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    FLASK_RUN_PORT = os.environ.get('FLASK_RUN_PORT')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL').replace('postgres://', 'postgresql://')
    SQLALCHEMY_ECHO = True
