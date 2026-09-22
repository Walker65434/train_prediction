import { getChannel } from '../config/rabbitmq.js';
import { broadcastTrainUpdate } from '../config/socket.js';
import Result from '../modules/result/result.model.js';

export const consumeResult = async () => {
  try {
    const channel = getChannel();
    const queue = process.env.RABBITMQ_RESULT_QUEUE;

    await channel.assertQueue(queue, { durable: true });

    console.log(`📥 Waiting for results from: ${queue}`);

    channel.consume(queue, async (message) => {
      if (!message) return;

      try {
        const resultData = JSON.parse(message.content.toString());

        console.log('📊 ETA Result Received: ', resultData.trainId);

        await Result.findOneAndUpdate(
          { trainId: resultData.trainId },
          resultData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        broadcastTrainUpdate(resultData.trainId, resultData);

        channel.ack(message);
      } catch (err) {
        console.error('RabbitMQ Result Processing Error: ', err.message);

        channel.nack(message, false, false);
      }
    });
  } catch (err) {
    console.error('RabbitMQ Result Consumer Error: ', err.message);
    throw err;
  }
};
