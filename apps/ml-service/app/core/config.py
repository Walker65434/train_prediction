from dotenv import load_dotenv
import os

load_dotenv()

# =====================================================
# RABBITMQ
# =====================================================

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://localhost")
START_QUEUE = os.getenv("START_QUEUE", "eta_start")
RESULT_QUEUE = os.getenv("RESULT_QUEUE", "eta_result")
STOP_QUEUE = os.getenv("STOP_QUEUE", "eta_stop")
RAILRADAR_API_KEY = os.getenv("RAILRADAR_API_KEY", "rg_25a4ea2534b7470a90d6ee5bd6395516")
