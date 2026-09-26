from dotenv import load_dotenv
import os

load_dotenv()

# =====================================================
# RABBITMQ
# =====================================================

RABBITMQ_URL = os.getenv("RABBITMQ_URL")
START_QUEUE = os.getenv("START_QUEUE")
RESULT_QUEUE = os.getenv("RESULT_QUEUE")
STOP_QUEUE = os.getenv("STOP_QUEUE")
RAILRADAR_API_KEY = os.getenv("RAILRADAR_API_KEY")
