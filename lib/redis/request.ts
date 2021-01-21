import { RedisClient, CreateConstructor } from './constructor';
import { EventEmitter } from 'events';

export interface ServiceRequestSend {
  method: string;
  data?: { [key: string]: any };
}

export async function ServiceRequest<T>(service: string, data: ServiceRequestSend, timeout?: number): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const nonce: string = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');

    const SubscriberClient = CreateConstructor();
    await SubscriberClient.subscribe(`${service}/${nonce}/receive`);
    SubscriberClient.on('message', (channel: string, message: string): void => {
      if (channel !== `${service}/${nonce}/receive`) return;
      SubscriberClient.quit();
      const data: { res: T; err: string } = JSON.parse(message);
      if (data.err) return reject(data.err);
      resolve(data.res);
    });

    if (timeout)
      setTimeout(() => {
        SubscriberClient.quit();
        reject(`service didn't respond in the set ${timeout}ms timeout`);
      }, timeout);

    RedisClient.publish(`${service}/${nonce}/send`, JSON.stringify(data), (err, res): void => {
      if (err || res === 0) reject(`${service} isn't listening for requests at this time`);
    });
  });
}

export declare interface ServiceRequestHandler {
  on(method: string, handler: (data: any, res: (res: any) => void, err: (err: string) => void) => void): this;
}

export class ServiceRequestHandler extends EventEmitter {
  constructor(service: string) {
    super();

    const globPattern = `${service}/*/send`;
    const regexPattern = new RegExp(`${service}\/*(.+)\/send`);

    const SubscriberClient = CreateConstructor();
    SubscriberClient.psubscribe(globPattern);
    SubscriberClient.on('pmessage', (pattern: string, channel: string, message: string): void => {
      if (pattern !== globPattern) return;
      const nonce = channel.replace(regexPattern, `$1`);
      const { method, data }: ServiceRequestSend = JSON.parse(message);
      this.emit(
        method,
        data,
        (res: any) => RedisClient.publish(`${service}/${nonce}/receive`, JSON.stringify({ res })),
        (err: string) => RedisClient.publish(`${service}/${nonce}/receive`, JSON.stringify({ err })),
      );
    });
  }
}
