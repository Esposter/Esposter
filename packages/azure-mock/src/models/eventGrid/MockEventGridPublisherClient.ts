import type { EventGridEvent, EventGridPublisherClient } from "@azure/eventgrid";
import type { Except } from "type-fest";

import { MockEventGridDatabase } from "@/store/MockEventGridDatabase";
/**
 * An in-memory mock of the Azure EventGridPublisherClient.
 * It uses a Map to simulate event grid storage and correctly implements the EventGridPublisherClient interface.
 * `client` is excluded because it is a private member of the real class and cannot be satisfied structurally.
 */
export class MockEventGridPublisherClient implements Except<EventGridPublisherClient<"EventGrid">, "apiVersion"> {
  readonly endpointUrl: string;
  readonly inputSchema: "EventGrid";
  readonly topicType: "EventGrid";

  constructor(endpoint: string, topicType: "EventGrid") {
    this.endpointUrl = endpoint;
    this.topicType = topicType;
    this.inputSchema = topicType;
  }

  send(newEvents: EventGridEvent<unknown>[]): Promise<void> {
    const events = MockEventGridDatabase.get(this.endpointUrl) ?? [];
    events.push(...newEvents);
    MockEventGridDatabase.set(this.endpointUrl, events);
    return Promise.resolve();
  }
}
