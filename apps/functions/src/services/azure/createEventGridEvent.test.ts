import type { EventGridEvent } from "@azure/functions";

import { describe } from "vitest";

// The envelope every Event Grid handler suite delivers, so a case spells out only the field it reads
export const createEventGridEvent = (overrides?: Partial<EventGridEvent>): EventGridEvent => ({
  data: {},
  dataVersion: "",
  eventTime: new Date(0).toISOString(),
  eventType: "",
  id: crypto.randomUUID(),
  metadataVersion: "",
  subject: "",
  topic: "",
  ...overrides,
});

describe.todo("createEventGridEvent");
