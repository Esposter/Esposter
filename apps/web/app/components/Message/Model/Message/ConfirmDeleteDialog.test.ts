// @vitest-environment nuxt
import MessageModelMessageConfirmDeleteDialog from "@/components/Message/Model/Message/ConfirmDeleteDialog.vue";
import UiConfirmDialog from "@/components/Ui/ConfirmDialog.vue";
import { createOptimisticMessage } from "@/services/message/createOptimisticMessage";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useUserStore } from "@/store/message/user";
import { MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageModelMessageConfirmDeleteDialog", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const userId = v7();
  const message = "message";
  const creator = createUser({ id: userId });

  test("restores only its own message when the delete is rejected", async () => {
    expect.hasAssertions();

    const { promise: deleteRequested, resolve: signalDeleteRequested } = Promise.withResolvers<void>();
    const { promise: deleteReleased, resolve: releaseDelete } = Promise.withResolvers<void>();
    trpcMsw.message.deleteMessage.mutation(async () => {
      signalDeleteRequested();
      await deleteReleased;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const component = await mountSuspended(MessageModelMessageConfirmDeleteDialog, { shallow: true });
    setCurrentRoomId(roomId);
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { getSlice } = dataStore;
    const userStore = useUserStore();
    const { storeUser } = userStore;
    // The dialog renders only once the message's author resolves, and the delete is answered from it
    storeUser(creator);
    const messageDialogStore = useMessageDialogStore();
    const { deletingMessageId } = storeToRefs(messageDialogStore);
    // The delete is sent by the room-assigned id, which an optimistic bubble has not been given
    const deletedMessage = {
      ...createOptimisticMessage({ message, roomId, type: MessageType.Message }, userId),
      id: 1,
    };
    getSlice(roomId).items.value = [deletedMessage];
    deletingMessageId.value = String(deletedMessage.id);
    await flushPromises();

    const deleted = component.getComponent(UiConfirmDialog).props("confirm")();
    await deleteRequested;
    // A message a subscription delivered while the delete was in flight
    const arrivedMessage = createOptimisticMessage({ message, roomId, type: MessageType.Message }, userId);
    getSlice(roomId).items.value = [arrivedMessage];
    releaseDelete();
    await deleted;
    await flushPromises();

    expect(items.value.map(({ id }) => id)).toStrictEqual([deletedMessage.id, arrivedMessage.id]);
  });
});
