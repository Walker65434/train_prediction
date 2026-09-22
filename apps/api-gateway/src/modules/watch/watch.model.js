import mongoose from 'mongoose';
import { STATUS, STOP_REASON } from '@repo/constants/watch';

const watchSchema = new mongoose.Schema(
  {
    watchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    trainId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: STATUS,
      default: 'ACTIVE',
      index: true,
    },

    lastHeartbeat: {
      type: Date,
      default: Date.now,
    },

    stopReason: {
      type: String,
      enum: STOP_REASON,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Watch', watchSchema);
