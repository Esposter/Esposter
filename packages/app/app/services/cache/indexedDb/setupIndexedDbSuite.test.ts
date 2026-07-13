/* eslint-disable vitest/require-top-level-describe */
import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { StandardMessageEntity } from "@esposter/db-schema";
import { randomUUID } from "node:crypto";
import { afterEach, describe } from "vitest";
// The shared indexedDb fixture: the canonical message triple (message3 shares message1's partition) and the
// Per-test database reset.
export const setupIndexedDbSuite = (): {
  message1: StandardMessageEntity;
  message2: StandardMessageEntity;
  message3: StandardMessageEntity;
} => {
  const message1 = new StandardMessageEntity({ partitionKey: randomUUID(), rowKey: randomUUID() });
  const message2 = new StandardMessageEntity({ partitionKey: randomUUID(), rowKey: randomUUID() });
  const message3 = new StandardMessageEntity({ partitionKey: message1.partitionKey, rowKey: randomUUID() });

  afterEach(async () => {
    await resetIndexedDb();
  });

  return { message1, message2, message3 };
};

describe.todo("setupIndexedDbSuite");
