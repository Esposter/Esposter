// @vitest-environment nuxt
import MessageModelMessageLinkPreviewContainer from "@/components/Message/Model/Message/LinkPreview/Container.vue";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { MessageType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelMessageLinkPreviewContainer", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const url = "url";
  const linkPreviewResponse = { favicons: [], mediaType: "", url };

  // The thread pane renders messages of a room other than the one on screen, so the removal reads the message out
  // Of its own room's slice — the room on screen holds nothing for it to take the embeds off
  test("removes the embeds of a message in a room other than the one on screen", async () => {
    expect.hasAssertions();

    const { promise: deleteGate, resolve: releaseDelete } = Promise.withResolvers<void>();
    trpcMsw.message.deleteLinkPreviewResponse.mutation(async () => {
      await deleteGate;
    });
    const message = createOptimisticMessage({ roomId: otherRoomId, type: MessageType.Message }, crypto.randomUUID());
    message.linkPreviewResponse = linkPreviewResponse;
    const component = await mountSuspended(MessageModelMessageLinkPreviewContainer, {
      props: { linkPreviewResponse, messageId: message.id, roomId: message.roomId },
    });
    setCurrentRoomId(roomId);
    const dataStore = useDataStore();
    const { getSlice } = dataStore;
    const { items } = getSlice(otherRoomId);
    items.value = [message];
    const deleted = component.findComponent({ name: "UiConfirmDialog" }).props("confirm")();
    await flushPromises();

    expect(takeOne(items.value).linkPreviewResponse).toBeNull();

    releaseDelete();
    await deleted;
  });

  // The remove button is faded out until the pointer is over the embed or the keyboard reaches it
  test("shows the remove button while the pointer is over the embed", async () => {
    expect.hasAssertions();

    const message = createOptimisticMessage({ roomId, type: MessageType.Message }, crypto.randomUUID());
    const component = await mountSuspended(MessageModelMessageLinkPreviewContainer, {
      props: { linkPreviewResponse, messageId: message.id, roomId: message.roomId },
    });
    const removeButton = component.get('[aria-label="Remove embeds"]');

    expect(removeButton.classes()).toContain("op-0");
    await component.trigger("mouseenter");
    expect(removeButton.classes()).not.toContain("op-0");
    await component.trigger("mouseleave");
    expect(removeButton.classes()).toContain("op-0");
  });
});
