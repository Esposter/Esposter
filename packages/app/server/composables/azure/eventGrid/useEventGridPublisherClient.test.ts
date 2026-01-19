import type { EventGridPublisherClient } from "@azure/eventgrid";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { MockEventGridPublisherClient } from "azure-mock";
import { describe } from "vitest";

export const useEventGridPublisherClientMock: typeof useEventGridPublisherClient = () =>
  new MockEventGridPublisherClient("", "EventGrid") as unknown as EventGridPublisherClient<"EventGrid">;

describe.todo(useEventGridPublisherClient);
