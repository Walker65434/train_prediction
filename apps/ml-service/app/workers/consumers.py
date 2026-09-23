import json
import threading
import time
from app.core.rabbitmq import get_channel
from app.core.config import START_QUEUE, STOP_QUEUE
from app.services.prediction_service import predict_eta
from app.workers.publishers import publish_result

# Global dictionary to track active prediction loops
active_trains = {}
active_trains_lock = threading.Lock()

# =====================================================
# PREDICTION LOOP
# =====================================================
def prediction_loop(train_id: str, stop_event: threading.Event):
    print(f"[LOOP START] Starting prediction loop for train: {train_id}", flush=True)
    
    # Run the loop until stop_event is set
    while not stop_event.is_set():
        try:
            # Generate and publish prediction
            result_payload = predict_eta(train_id)
            publish_result(result_payload)
        except Exception as e:
            print(f"[LOOP ERROR] Error predicting/publishing for {train_id}: {e}", flush=True)
        
        # Wait 60 seconds before next prediction (Rate limit: 1 req/min)
        stop_event.wait(60)
        
    print(f"[LOOP END] Stopped prediction loop for train: {train_id}", flush=True)


# =====================================================
# PROCESS TRAIN START
# =====================================================
def process_train_start(ch, method, properties, body):
    try:
        message = json.loads(body)
        train_id = message.get("trainId")
        if not train_id:
            raise ValueError("trainId missing from start message")

        print(f"▶️ Received START for Train ID: {train_id}", flush=True)

        with active_trains_lock:
            if train_id not in active_trains:
                stop_event = threading.Event()
                active_trains[train_id] = stop_event
                
                # Start background loop
                t = threading.Thread(target=prediction_loop, args=(train_id, stop_event), daemon=True)
                t.start()
            else:
                print(f"Train {train_id} is already being tracked.", flush=True)

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as err:
        print(f"Start Consumer Error: {err}", flush=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


# =====================================================
# PROCESS TRAIN STOP
# =====================================================
def process_train_stop(ch, method, properties, body):
    try:
        message = json.loads(body)
        train_id = message.get("trainId")
        if not train_id:
            raise ValueError("trainId missing from stop message")

        print(f"⏹️ Received STOP for Train ID: {train_id}", flush=True)

        with active_trains_lock:
            if train_id in active_trains:
                active_trains[train_id].set()  # Signal loop to stop
                del active_trains[train_id]
                print(f"Signaled loop to stop for {train_id}", flush=True)
            else:
                print(f"Train {train_id} is not currently being tracked.", flush=True)

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as err:
        print(f"Stop Consumer Error: {err}", flush=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


# =====================================================
# START CONSUMER
# =====================================================
def start_consumer():
    try:
        connection, channel = get_channel()
        channel.basic_qos(prefetch_count=10)
        
        # Declare queues
        channel.queue_declare(queue=START_QUEUE, durable=True)
        channel.queue_declare(queue=STOP_QUEUE, durable=True)
        
        # Consume from START queue
        channel.basic_consume(
            queue=START_QUEUE,
            on_message_callback=process_train_start,
            auto_ack=False,
        )
        
        # Consume from STOP queue
        channel.basic_consume(
            queue=STOP_QUEUE,
            on_message_callback=process_train_stop,
            auto_ack=False,
        )
        
        print(f"Waiting for messages on {START_QUEUE} and {STOP_QUEUE}...", flush=True)
        channel.start_consuming()

    except Exception as err:
        print(f"CONSUMER CRASHED: {err}", flush=True)
