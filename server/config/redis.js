const { Queue } = require('bullmq');
const IORedis = require('ioredis');

let connection;
let triageQueue;

const connectRedis = () => {
  try {
    connection = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null
    });

    triageQueue = new Queue('triage', { connection });

    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    process.exit(1);
  }
};

const getTriageQueue = () => {
  if (!triageQueue) {
    throw new Error('Triage queue not initialized');
  }
  return triageQueue;
};

module.exports = { connectRedis, getTriageQueue };