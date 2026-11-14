import { resetIndexedDb } from "@/services/cache/indexedDb/openIndexedDb";
import { createMessage } from "@/services/message/message/createMessage.test";
import { v7 } from "uuid";
import { afterEach, describe } from "vitest";

// The shared indexedDb fixture: the canonical message triple (message3 shares message1's room) and the
// Per-test database reset.
export const setupIndexedDbSuite = () => {
  const message1 = createMessage(v7());
  const message2 = createMessage(v7());
  const message3 = createMessage(message1.roomId);

  afterEach(async () => {
    await resetIndexedDb();
  });

  return { message1, message2, message3 };
};

describe.todo("setupIndexedDbSuite");
