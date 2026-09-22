import { Router } from 'express';
import { startWatch } from './watch.controller.js';

const router = Router();

router.post('/', startWatch);

export default router;
