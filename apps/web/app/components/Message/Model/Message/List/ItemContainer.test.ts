// @vitest-environment nuxt
import MessageModelMessageListItem from "#src/components/Message/Model/Message/List/Item.vue";
import MessageModelMessageListItemContainer from "#src/components/Message/Model/Message/List/ItemContainer.vue";
import MessageModelMessageOptionsMenu from "#src/components/Message/Model/Message/OptionsMenu/Index.vue";
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { MessageType } from "@esposter/db-schema";
import { getZonedDateTime } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("messageModelMessageListItemContainer", () => {
  const roomId = v7();
  // The local midnight of the epoch's day, so its time and day read the same in every zone
  const createdAt = getZonedDateTime(new Date(0)).startOfDay().toInstant();

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date", "Temporal"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // A member who left the room has no row for the room to name them by, so a list that drew only messages with a known
  // Creator dropped every message they wrote. An author nobody can resolve is drawn under the placeholder instead
  test("draws a message whose author nobody can resolve", async () => {
    expect.hasAssertions();

    vi.setSystemTime(createdAt);
    const message = "message";
    const clientMessage = createOptimisticMessage({ message, roomId, type: MessageType.Message }, v7());
    const component = await mountSuspended(MessageModelMessageListItemContainer, { props: { message: clientMessage } });

    expect(component.findComponent(MessageModelMessageListItem).exists()).toBe(true);
    expect(component.text()).toMatchInlineSnapshot(`"UUnknown user0:00messageToday"`);
  });

  // A keyboard reader reaches the options bar by focusing the row, which mounts the bar as a hover does
  test("mounts the options bar when the row takes focus", async () => {
    expect.hasAssertions();

    vi.setSystemTime(createdAt);
    const clientMessage = createOptimisticMessage({ message: "message", roomId, type: MessageType.Message }, v7());
    const component = await mountSuspended(MessageModelMessageListItemContainer, { props: { message: clientMessage } });

    await component.get(`[id="${clientMessage.id}"]`).trigger("focusin");
    await flushPromises();

    expect(component.findComponent(MessageModelMessageOptionsMenu).exists()).toBe(true);
  });
});
