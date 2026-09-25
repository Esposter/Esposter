// @vitest-environment nuxt
import MessageModelMessageLinkPreviewContainer from "@/components/Message/Model/Message/LinkPreview/Container.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelMessageLinkPreviewContainer", () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const url = "url";

  // The thread pane renders messages of a room other than the one on screen, so the removal reads the message out
  // Of its own room's slice — the room on screen holds nothing for it to take the embeds off
  test("removes the embeds of a message in a room other than the one on screen", async () => {
    expect.hasAssertions();

    const { promise: deleteGate, resolve: releaseDelete } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.message.deleteLinkPreviewResponse.mutation(async () => {
        await deleteGate;
      }),
    );
    const linkPreviewResponse = { favicons: [], mediaType: "", url };
    const message = createMessageEntity({
      roomId: otherRoomId,
      type: MessageType.Message,
      userId: crypto.randomUUID(),
    });
    message.linkPreviewResponse = linkPreviewResponse;
    const component = await mountSuspended(MessageModelMessageLinkPreviewContainer, {
      props: { linkPreviewResponse, partitionKey: message.partitionKey, rowKey: message.rowKey },
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
});
