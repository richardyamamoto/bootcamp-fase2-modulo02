import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';

import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    // Allocate jobs in this attribute
    this.queues = {};
    this.init();
  }

  init() {
    // Init queues
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        // Queue with redis connection
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        // Method that process the job
        handle,
      };
    });
  }

  // Adding new items in queue
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  // Processing queues
  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];
      bee.process(handle);
    });
  }
}

export default new Queue();
