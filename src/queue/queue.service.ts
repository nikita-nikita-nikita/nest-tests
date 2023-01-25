import { Injectable } from '@nestjs/common';

export const timer = (delay, toReturn = null) => new Promise(resolve => setTimeout(() => {
          resolve(toReturn);
      }, delay))

class Queue<T, V> {
  queueSize: number;
  queueTimeout: number;
  maxWorkersSum: number;
  handler: (arg: T) => Promise<V>;
  tasksToDo = new Set();
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
  // there should be to type of adding task or some another mechanizm of adding tasks
  async push(task: T) {
    const addedTaskIndex = this.index;
    this.index += 1;
    if (this.stack.size >= this.queueSize) {
      throw new Error('to many tasks');
    }
    if (this.tasksInProcess > this.maxWorkersSum) {
      throw new Error('to many going in parallesls');
    }
    const taskToDo = async () => {
      if (this.tasksInProcess === this.maxWorkersSum) {
        await Promise.any(Array.from(this.stack));
      }
      this.tasksInProcess++;
      this.result[addedTaskIndex] = await this.handler(task);
    };
    const promise = taskToDo();
    this.tasksToDo.add(promise);
    this.stack.add(promise);
    promise.then(() => {
      this.stack.delete(promise);
      this.tasksInProcess--;
    });
  }
  timer() {
    return timer(this.queueTimeout, this.timeoutErrorSymbol);
  }
  async getResult(){
      const result = await Promise.race([Promise.all(Array.from(this.tasksToDo)), this.timer()]);
      
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
