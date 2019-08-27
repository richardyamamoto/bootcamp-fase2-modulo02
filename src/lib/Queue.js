import Bee from 'bee-queue';
import CancellationMail from '../app/jobs/CancellationMail';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};
  }

  init() {
    jobs.forEach();
  }
}

export default new Queue();
