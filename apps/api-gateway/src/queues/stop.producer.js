import { getChannel } from '../config/rabbitmq.js';

export const publishStop = async (trainId) => {
  try {
    const channel = getChannel();

    const message = { trainId };

    channel.sendToQueue(
      process.env.RABBITMQ_STOP_QUEUE,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`⏹️ Train ETA Stopped: ${trainId}`);
  } catch (err) {
    console.error('RabbitMQ Stop Publish Error: ', err.message);
    throw err;
  }
};
