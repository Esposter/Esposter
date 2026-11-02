import type { EventGridEvent, EventGridPublisherClient } from "@azure/eventgrid";
import type { Except } from "type-fest";

import { MockRestError } from "#src/models/shared/MockRestError";
import { MockEventGridDatabase } from "#src/store/MockEventGridDatabase";
import { MAX_EVENT_GRID_PUBLISH_EVENT_COUNT, MAX_EVENT_GRID_PUBLISH_REQUEST_BYTES } from "@esposter/azure";
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

  // The service refuses a publish request over its event count or its byte size whole, so none of its events lands.
  // The bytes are measured on the serialized events, the part of the request the publisher hands over
  send(newEvents: EventGridEvent<unknown>[]): Promise<void> {
    if (
      newEvents.length > MAX_EVENT_GRID_PUBLISH_EVENT_COUNT ||
      Buffer.byteLength(JSON.stringify(newEvents)) > MAX_EVENT_GRID_PUBLISH_REQUEST_BYTES
    )
      throw new MockRestError("The publish request exceeds the Event Grid publish limits.", 413);
    getOrCreate(MockEventGridDatabase, this.endpointUrl, () => []).push(...newEvents);
    return Promise.resolve();
  }
}
