// @vitest-environment nuxt
import MessageModelMessageListItem from "@/components/Message/Model/Message/List/Item.vue";
import MessageModelMessageListItemContainer from "@/components/Message/Model/Message/List/ItemContainer.vue";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageModelMessageListItemContainer", () => {
  const roomId = v7();

  // A member who left the room has no row for the room to name them by, so a list that drew only messages with a known
  // Creator dropped every message they wrote. An author nobody can resolve is drawn under the placeholder instead
  test("draws a message whose author nobody can resolve", async () => {
    expect.hasAssertions();

    const message = "message";
    const clientMessage = createOptimisticMessage({ message, roomId, type: MessageType.Message }, v7());
    const component = await mountSuspended(MessageModelMessageListItemContainer, { props: { message: clientMessage } });

    expect(component.findComponent(MessageModelMessageListItem).exists()).toBe(true);
    expect(component.text()).toContain(message);
  });
});
