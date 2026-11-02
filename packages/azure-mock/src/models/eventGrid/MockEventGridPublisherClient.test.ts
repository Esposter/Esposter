import type { EventGridEvent } from "@azure/eventgrid";

import { MockEventGridPublisherClient } from "#src/models/eventGrid/MockEventGridPublisherClient";
import { MockEventGridDatabase } from "#src/store/MockEventGridDatabase";
import { MAX_EVENT_GRID_PUBLISH_EVENT_COUNT, MAX_EVENT_GRID_PUBLISH_REQUEST_BYTES } from "@esposter/azure";
import { afterEach, describe, expect, test } from "vitest";

const createEvent = (data: string): EventGridEvent<unknown> => ({
  data,
  dataVersion: "",
  eventTime: new Date(0),
  eventType: "",
  id: "",
  subject: "",
});

describe(MockEventGridPublisherClient, () => {
  const endpoint = "";

  afterEach(() => {
    MockEventGridDatabase.clear();
  });

  // The service refuses a publish request past its event count or its byte size whole, so none of its events lands
  test("refuses a publish over the event count or the request size and delivers none of it", () => {
    expect.hasAssertions();

    const client = new MockEventGridPublisherClient(endpoint, "EventGrid");
    const overCountEvents = Array.from({ length: MAX_EVENT_GRID_PUBLISH_EVENT_COUNT + 1 }, () => createEvent(""));
    const overSizeEvents = [createEvent("a".repeat(MAX_EVENT_GRID_PUBLISH_REQUEST_BYTES))];

    expect(() => client.send(overCountEvents)).toThrowErrorMatchingInlineSnapshot(
      `[MockRestError: The publish request exceeds the Event Grid publish limits.]`,
    );
    expect(() => client.send(overSizeEvents)).toThrowErrorMatchingInlineSnapshot(
      `[MockRestError: The publish request exceeds the Event Grid publish limits.]`,
    );
    expect(MockEventGridDatabase.get(endpoint)).toBeUndefined();
  });
});
