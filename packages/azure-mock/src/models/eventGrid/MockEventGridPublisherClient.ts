import type { EventGridEvent, EventGridPublisherClient } from "@azure/eventgrid";
import type { Except } from "type-fest";

import { MockEventGridDatabase } from "@/store/MockEventGridDatabase";
import { getOrCreate } from "@esposter/shared";
/**
 * An in-memory mock of the Azure EventGridPublisherClient — no emulator and no network.
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
    getOrCreate(MockEventGridDatabase, this.endpointUrl, () => []).push(...newEvents);
    return Promise.resolve();
  }
}
