import amqp from 'amqplib';
import { consumeResult } from '../queues/result.consumer.js';

let channel;
let connection;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    // NOTE: Queue Assert
    await channel.assertQueue(process.env.RABBITMQ_START_QUEUE, {
      durable: true,
    });
    await channel.assertQueue(process.env.RABBITMQ_STOP_QUEUE, {
      durable: true,
    });
    await channel.assertQueue(process.env.RABBITMQ_RESULT_QUEUE, {
      durable: true,
    });

    console.log('📨 RabbitMQ Connected!!');

    // NOTE: Consume Messages
    await consumeResult();
  } catch (err) {
    console.error('🚩 RabbitMQ Connection Error: ', err.message);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized!');
  }

  return channel;
};
