import type { EventGridPublisherClient } from "@azure/eventgrid";

import { MockEventGridPublisherClient } from "azure-mock";
import { describe } from "vitest";

export const MOCK_EVENT_GRID_ENDPOINT = "mock-endpoint";

export const eventGridPublisherClient = new MockEventGridPublisherClient(
  MOCK_EVENT_GRID_ENDPOINT,
  "EventGrid",
) as unknown as EventGridPublisherClient<"EventGrid">;

describe.todo("eventGridPublisherClient");
