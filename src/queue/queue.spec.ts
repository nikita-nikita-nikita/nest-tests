import { QueueService } from './queue.service';

describe('CatsController', () => {
  let queueService: QueueService;

  beforeEach(() => {
    queueService = new QueueService();
  });

  describe('findAll', () => {
    it('should return an array expected numbers', async () => {
        const queue = await queueService.generateQueue<string, number>(1000, 5000, 10, (value) => Promise.resolve(+value));
        queue.push("1");
        queue.push("2");
        queue.push("3");
        queue.push("4");
        queue.push("5");
      expect(await queue.getResult()).toEqual([1,2,3,4,5]);
    });
    it('if task works more then expected timout return an error', async () => {
        const queue = await queueService.generateQueue<string, number>(1000, 1000, 2, (value) => new Promise((resolve) => {
            setTimeout(() => {
                resolve(+value);
            }, 100);
        }));
        
      expect(await queue.getResult()).toEqual("error");
    });
  });
});