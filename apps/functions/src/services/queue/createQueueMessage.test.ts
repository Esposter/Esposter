import type { Message } from "@cloudflare/workers-types";

import { describe, vi } from "vitest";

// A message as the queue delivers it to a handler, with its acknowledge and retry recorded.
// It is shared by the batch and the dead-letter suites, so the two read a message the same way.
export const createQueueMessage = (id: string, body: unknown): Message => ({
  ack: vi.fn<() => void>(),
  attempts: 1,
  body,
  id,
  retry: vi.fn<() => void>(),
  timestamp: new Date(0),
});

describe.todo("createQueueMessage");
