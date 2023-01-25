import { QueueService, timer } from './queue.service';

describe('CatsController', () => {
  let queueService: QueueService;

  beforeEach(() => {
    queueService = new QueueService();
  });

  describe('queue', () => {
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
            }, 2000);
        }));
        queue.push("1");
        queue.push("2");
        queue.push("3");
        queue.push("4");
        queue.push("5");
        
      expect(await queue.getResult()).toEqual("error");
    });
    it('that time of all tasks will be less then time of all tasks devided by amount of paralels tasks', async () => {
        const queue = await queueService.generateQueue<string, number>(1000, 1000, 2, (value) => new Promise((resolve) => {
            setTimeout(() => {
                resolve(+value);
            }, 100);
        }));
        queue.push("1");
        queue.push("2");
        queue.push("3");
        queue.push("4");
        queue.push("5");
        
      expect(await Promise.race([queue.getResult(), timer(260)])).toEqual([1,2,3,4,5]);
    });
    it('that time of all tasks will be more then time of all tasks devided by amount of paralels tasks', async () => {
        const queue = await queueService.generateQueue<string, number>(1000, 1000, 2, (value) => new Promise((resolve) => {
            setTimeout(() => {
                resolve(+value);
            }, 100);
        }));
        queue.push("1");
        queue.push("2");
        queue.push("3");
        queue.push("4");
        queue.push("5");
        const errorSymbol = Symbol("error")
      expect(await Promise.race([queue.getResult(), timer(200, errorSymbol)])).toEqual(errorSymbol);
    });
  });
});