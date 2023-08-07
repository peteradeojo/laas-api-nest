// import cron from 'node-cron';
const cron = require('node-cron');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { gatherMetrics } from './metric-collator';

console.log('Starting tasks');
// const task = cron.schedule('*/10 * * * *', async() => {
//     console.log("Running task");
//     await gatherMetrics();
// }, {
//     timezone: "Africa/Lagos"
// });
// task.start();

setInterval(async () => {
  console.log('Running task');
  try {
    await gatherMetrics();
  } catch (err) {
    console.error(err);
  }
}, 10000);
