import { getChannel } from '../config/rabbitmq.js';

export const publishStart = async (trainId) => {
  try {
    const channel = getChannel();

    const message = { trainId };

    channel.sendToQueue(
      process.env.RABBITMQ_START_QUEUE,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`▶️  Train ETA Started: ${trainId}`);
  } catch (err) {
    console.error('RabbitMQ Start Publish Error: ', err.message);
    throw err;
  }
};
