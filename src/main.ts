import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

class Queue<T>{
  limit = 50;
  stack = new Set<Promise<T>>();
  constructor(limit) {
    this.limit = limit;
  }
  async push(promise) {
    if(this.stack.size >= this.limit){
      throw new Error("stack overflow");
    }
    this.stack.add(promise);
    promise.then(() => this.stack.delete(promise));
  }
}

const taskAmount = 15;

async function* asyncGenerator() {
  let i = 0;
  while (i < taskAmount) {
    yield i++;
  }
}

const getRandomTime = () => Math.floor(Math.random() * 1000) + 10;

const getRandomTask = (index) =>
 new Promise((resolve) => {
    setTimeout(() => {
      console.log(`task ${index} done`);
      resolve(index);
    }, getRandomTime());
  });

async function bootstrap() {
  const queue = new Queue(10);
  for await (const index of asyncGenerator()) {
    try{
    queue.push(getRandomTask(index)); 
    }catch(error){
      console.log(error);
    }
  }  
  // const app = await NestFactory.create(AppModule);
  // await app.listen(3000);
}
bootstrap();
