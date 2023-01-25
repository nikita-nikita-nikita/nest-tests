import { Injectable } from '@nestjs/common';

class Queue<T, V> {
  queueSize: number;
  queueTimeout: number;
  maxWorkersSum: number;
  handler: (arg: T) => Promise<V>;
  stack = new Set<Promise<unknown>>();
  result: V[] = [];
  tasksInProcess = 0;
  index = 0;
  timeoutErrorSymbol = Symbol("timeoutErrorSymbol")
  constructor(queueSize, queueTimeout, maxWorkersSum, handler) {
    this.queueSize = queueSize;
    this.queueTimeout = queueTimeout;
    this.maxWorkersSum = maxWorkersSum;
    this.handler = handler;
  }
  clear() {
    this.stack.clear();
  }
  async push(task: T) {
    const addedTaskIndex = this.index;
    this.index += 1;
    if (this.stack.size >= this.queueSize) {
      throw new Error('to many tasks');
    }
    if (this.tasksInProcess === this.maxWorkersSum) {
      throw new Error('to many going in parallesls');
    }
    const taskToDo = async () => {
        this.result[addedTaskIndex] = await this.handler(task);
    };
    const promise = taskToDo();
    this.stack.add(promise);
    promise.then(() => this.stack.delete(promise));
  }
  
  timer(){
      return new Promise(resolve => setTimeout(() => {
          resolve(this.timeoutErrorSymbol);
      }, this.queueTimeout))
  }
  async getResult(){
      const result = await Promise.race([Promise.all(Array.from(this.stack)), this.timer()]);
      if(result === this.timeoutErrorSymbol){
          return "error"
      }
      return this.result
      }
}

@Injectable()
export class QueueService {

  async generateQueue<T = unknown, V = unknown>(
    queueSize: number,
    queueTimeout: number,
    maxWorkersSum: number,
    handler: (arg: T) => Promise<V>,
  ) {
    return new Queue<T, V>(queueSize, queueTimeout, maxWorkersSum, handler);
  }
}
