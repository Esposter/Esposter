import type { EventGridPublisherClient } from "@azure/eventgrid";

import { MockEventGridPublisherClient } from "azure-mock";
import { describe } from "vitest";

export const useEventGridPublisherClient = (): EventGridPublisherClient<"EventGrid"> =>
  new MockEventGridPublisherClient("", "EventGrid") as unknown as EventGridPublisherClient<"EventGrid">;

describe.todo("useEventGridPublisherClient");
