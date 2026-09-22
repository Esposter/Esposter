import type { EventGridPublisherClient } from "@azure/eventgrid";

import { MOCK_EVENT_GRID_ENDPOINT } from "#src/services/azure/constants.test";
import { MockEventGridPublisherClient } from "azure-mock";
import { describe } from "vitest";

export const eventGridPublisherClient = new MockEventGridPublisherClient(
  MOCK_EVENT_GRID_ENDPOINT,
  "EventGrid",
) as unknown as EventGridPublisherClient<"EventGrid">;

describe.todo("eventGridPublisherClient");
