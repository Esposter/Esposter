// @vitest-environment nuxt
import MessageModelMessageConfirmDeleteDialog from "@/components/Message/Model/Message/ConfirmDeleteDialog.vue";
import StyledDeleteFormDialog from "@/components/Styled/DeleteFormDialog.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useUserStore } from "@/store/message/user";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelMessageConfirmDeleteDialog", () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  const creator = createUser({ id: userId });

  test("restores only its own message when the delete is rejected", async () => {
    expect.hasAssertions();

    const { promise: deleteRequested, resolve: signalDeleteRequested } = Promise.withResolvers<void>();
    const { promise: deleteReleased, resolve: releaseDelete } = Promise.withResolvers<void>();
    server.use(
      trpcMsw.message.deleteMessage.mutation(async () => {
        signalDeleteRequested();
        await deleteReleased;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "rejected" });
      }),
    );
    const component = await mountSuspended(MessageModelMessageConfirmDeleteDialog, { shallow: true });
    setCurrentRoomId(roomId);
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const { getSlice } = dataStore;
    const userStore = useUserStore();
    const { storeUser } = userStore;
    // The dialog renders only once the message's author resolves, and the delete is emitted from it
    storeUser(creator);
    const messageDialogStore = useMessageDialogStore();
    const { deletingRowKey } = storeToRefs(messageDialogStore);
    const deletedMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    getSlice(roomId).items.value = [deletedMessage];
    deletingRowKey.value = deletedMessage.rowKey;
    await flushPromises();

    component.getComponent(StyledDeleteFormDialog).vm.$emit("delete", noop);
    await deleteRequested;
    // A message a subscription delivered while the delete was in flight
    const arrivedMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    getSlice(roomId).items.value = [arrivedMessage];
    releaseDelete();
    await flushPromises();

    expect(items.value.map(({ rowKey }) => rowKey)).toStrictEqual([deletedMessage.rowKey, arrivedMessage.rowKey]);
  });
});
