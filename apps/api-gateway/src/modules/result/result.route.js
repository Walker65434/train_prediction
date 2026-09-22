import { Router } from 'express';
import { getTrainResult } from './result.controller.js';

const router = Router();

router.get('/:trainId', getTrainResult);

export default router;
