import json
import pika
from app.core.rabbitmq import get_channel
from app.core.config import RESULT_QUEUE

def publish_result(result_payload: dict):
    try:
        connection, channel = get_channel()
        channel.queue_declare(queue=RESULT_QUEUE, durable=True)
        
        message = json.dumps(result_payload)
        channel.basic_publish(
            exchange="",
            routing_key=RESULT_QUEUE,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent
            )
        )
        print(f"Result published to {RESULT_QUEUE}: {result_payload.get('trainId')}", flush=True)
    except Exception as e:
        print(f"Error publishing result: {e}", flush=True)
