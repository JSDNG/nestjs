import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    await this.init();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async init() {
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || 5672;
    const user = process.env.RABBITMQ_USER || 'user';
    const password = process.env.RABBITMQ_PASSWORD || 'password';

    this.connection = await amqp.connect(
      `amqp://${user}:${password}@${host}:${port}`,
    );
    this.channel = await this.connection.createChannel();

    // Tạo exchange kiểu direct
    const exchange = 'direct_logs';
    await this.channel.assertExchange(exchange, 'direct', { durable: false });

    // Tạo queue và liên kết với exchange
    const infoQueue = 'info_logs';
    const errorQueue = 'error_logs';

    // Tạo queue mà không có DLX
    await this.channel.assertQueue(infoQueue, {
      durable: false,
      arguments: { 'x-message-ttl': 60000 }, // TTL 1 phút
    });
    await this.channel.assertQueue(errorQueue, {
      durable: false,
      arguments: { 'x-message-ttl': 60000 }, // TTL 1 phút
    });

    await this.channel.bindQueue(infoQueue, exchange, 'info');
    await this.channel.bindQueue(errorQueue, exchange, 'error');
  }

  private async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  async sendMessage(queue: string, message: string) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
  }

  async consumeMessages(
    queue: string,
    callback: (message: string) => void,
    options?: amqp.Options.Consume,
  ) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          callback(msg.content.toString());
          if (!options?.noAck) {
            this.channel.ack(msg);
          }
        }
      },
      options,
    );
  }

  async deleteQueue(queue: string) {
    await this.channel.deleteQueue(queue);
  }

  // Phương thức gửi tin nhắn với routing key
  async publishMessage(level: string, message: string) {
    const exchange = 'direct_logs';
    this.channel.publish(exchange, level, Buffer.from(message));
  }

  async consumeInfoLogs(callback: (message: string) => void) {
    const queue = 'info_logs';
    await this.channel.assertQueue(queue, { durable: false });
    this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        callback(msg.content.toString());
        this.channel.ack(msg); // Xác nhận tin nhắn
      }
    });
  }

  async consumeErrorLogs(callback: (message: string) => void) {
    const queue = 'error_logs';
    await this.channel.assertQueue(queue, { durable: false });
    this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        callback(msg.content.toString());
        this.channel.ack(msg);
      }
    });
  }
}
