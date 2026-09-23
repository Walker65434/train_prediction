from pymongo import MongoClient
from app.core.config import MONGODB_URI, DATABASE_NAME

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

forms_collection = db["forms"]
results_collection = db["results"]
