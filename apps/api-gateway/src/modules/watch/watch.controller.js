import { v4 as uuidv4 } from 'uuid';
import Watch from './watch.model.js';
import { publishStart } from '../../queues/start.producer.js';

// NOTE: Watch Start Handler
export const startWatch = async (req, res) => {
  try {
    const { trainId } = req.body;

    if (!trainId) {
      return res.status(400).json({ message: 'trainId is required !' });
    }

    const watchId = uuidv4();

    const watchSession = await Watch.create({
      watchId,
      trainId,
      status: 'ACTIVE',
    });

    const activeWatchesCount = await Watch.countDocuments({
      trainId,
      status: 'ACTIVE',
    });

    if (activeWatchesCount === 1) {
      await publishStart(trainId);
    }

    return res.status(201).json({
      watchId: watchSession.watchId,
      trainId: watchSession.trainId,
      status: watchSession.status,
      message: 'Watch session started successfully !!',
    });
  } catch (err) {
    console.error('Error starting watch session: ', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
