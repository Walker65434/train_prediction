import pika
from app.core.config import RABBITMQ_URL, START_QUEUE, STOP_QUEUE, RESULT_QUEUE


def get_channel():
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    channel.queue_declare(queue=START_QUEUE, durable=True)
    channel.queue_declare(queue=STOP_QUEUE, durable=True)
    channel.queue_declare(queue=RESULT_QUEUE, durable=True)
    return connection, channel
