import type { EventGridEvent, EventGridPublisherClient } from "@azure/eventgrid";
import type { Except } from "type-fest";

import { MockEventGridDatabase } from "@/store/MockEventGridDatabase";
/**
 * An in-memory mock of the Azure EventGridPublisherClient.
 * It uses a Map to simulate event grid storage and correctly implements the EventGridPublisherClient interface.
 */
export class MockEventGridPublisherClient
  implements Except<EventGridPublisherClient<"EventGrid">, "apiVersion" | "endpointUrl">
{
  endpoint: string;
  topicType: "EventGrid";

  constructor(endpoint: string, topicType: "EventGrid") {
    this.endpoint = endpoint;
    this.topicType = topicType;
  }

  send(newEvents: EventGridEvent<unknown>[]): Promise<void> {
    const events = MockEventGridDatabase.get(this.endpoint) ?? [];
    events.push(...newEvents);
    MockEventGridDatabase.set(this.endpoint, events);
    return Promise.resolve();
  }
}
