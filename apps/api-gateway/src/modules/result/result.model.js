import mongoose from 'mongoose';
import { TRAIN_STATUS, STATION_STATUS } from '@repo/constants/result';

const stationSchema = new mongoose.Schema(
  {
    stationCode: { type: String, trim: true },

    stationName: { type: String, trim: true },

    scheduledArrival: { type: Date },

    expectedArrival: { type: Date },

    scheduledDeparture: { type: Date },

    expectedDeparture: { type: Date },

    status: { type: String, enum: STATION_STATUS },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    trainId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    trainName: { type: String, trim: true },

    source: { stationCode: String, stationName: String },

    destination: { stationCode: String, stationName: String },

    currStation: { stationCode: String, stationName: String },

    nextStation: { stationCode: String, stationName: String },

    status: { type: String, enum: TRAIN_STATUS },

    delayMin: { type: Number, default: 0 },

    location: { latitude: Number, longitude: Number },

    speed: { type: Number, default: 0 },

    eta: {
      arrivalTime: Date,

      delayMinutes: { type: Number, default: 0 },
    },

    route: { type: [stationSchema], default: [] },

    prediction: {
      predictedAt: { type: Date },

      modelVersion: { type: String },

      confidence: { type: Number, min: 0, max: 1 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Result', resultSchema);
