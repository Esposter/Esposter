import type {
  MessageSendRequest,
  Queue,
  QueueMetrics,
  QueueSendBatchResponse,
  QueueSendResponse,
} from "@cloudflare/workers-types";
import type { QueueJob } from "@esposter/db-schema";

import { MockJobQueueDatabase } from "#src/services/MockJobQueueDatabase";
import { getOrCreate } from "@esposter/shared";

// The producer binding's own `Queue` interface, so the double is what `getJobQueue` returns.
// Nothing is ever backed up here, so every backlog it reports is empty.
export class MockJobQueue implements Queue {
  readonly job: QueueJob;
  readonly #backlog = { backlogBytes: 0, backlogCount: 0 };

  constructor(job: QueueJob) {
    this.job = job;
  }

  metrics(): Promise<QueueMetrics> {
    return Promise.resolve(this.#backlog);
  }

  send(body: unknown): Promise<QueueSendResponse> {
    this.#record(body);
    return Promise.resolve({ metadata: { metrics: this.#backlog } });
  }

  sendBatch(messages: Iterable<MessageSendRequest>): Promise<QueueSendBatchResponse> {
    for (const { body } of messages) this.#record(body);
    return Promise.resolve({ metadata: { metrics: this.#backlog } });
  }

  #record(body: unknown) {
    getOrCreate(MockJobQueueDatabase, this.job, () => []).push(body);
  }
}
