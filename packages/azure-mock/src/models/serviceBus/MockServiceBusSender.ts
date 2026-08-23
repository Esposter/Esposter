import type { ServiceBusMessage, ServiceBusMessageBatch, ServiceBusSender } from "@azure/service-bus";
import type { MapValue } from "@esposter/shared";

import { MockServiceBusDatabase } from "#src/store/MockServiceBusDatabase";
import { getOrCreate } from "@esposter/shared";
/**
 * An in-memory mock of the Azure ServiceBusSender — no emulator and no network.
 *
 * @example
 * const mockServiceBusSender = new MockServiceBusSender("hello world");
 * await mockServiceBusSender.scheduleMessages({ body: "hello world" }, new Date());
 */
export class MockServiceBusSender implements ServiceBusSender {
  entityPath: string;
  identifier: string;
  isClosed = false;

  get queue(): MapValue<typeof MockServiceBusDatabase> {
    return getOrCreate(MockServiceBusDatabase, this.entityPath, () => []);
  }

  constructor(queueName: string) {
    this.entityPath = queueName;
    this.identifier = queueName;
  }

  cancelScheduledMessages(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  close(): Promise<void> {
    this.isClosed = true;
    return Promise.resolve();
  }

  createMessageBatch(): Promise<ServiceBusMessageBatch> {
    throw new Error("Method not implemented.");
  }

  scheduleMessages(messages: ServiceBusMessage | ServiceBusMessage[], scheduledEnqueueTimeUtc: Date): Promise<never[]> {
    for (const message of Array.isArray(messages) ? messages : [messages])
      this.queue.push({ ...message, scheduledEnqueueTimeUtc });
    return Promise.resolve([]);
  }

  sendMessages(messages: ServiceBusMessage | ServiceBusMessage[] | ServiceBusMessageBatch): Promise<void> {
    if (!Array.isArray(messages) && "tryAddMessage" in messages) throw new Error("Method not implemented.");
    this.queue.push(...(Array.isArray(messages) ? messages : [messages]));
    return Promise.resolve();
  }
}
