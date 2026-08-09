// @vitest-environment nuxt
import MessageModelMessageConfirmDeleteDialog from "@/components/Message/Model/Message/ConfirmDeleteDialog.vue";
import StyledDeleteFormDialog from "@/components/Styled/DeleteFormDialog.vue";
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

  // The behaviour matrix for a singleton dialog whose item leaves its list lives in useSingletonDialog's own
  // Test; here only that this dialog resolves through the primitive rather than a computed of its own
  test("drops the target when its message leaves the timeline", async () => {
    expect.hasAssertions();

    // Shallow because the reconciliation under test lives in setup, and happy-dom has no visualViewport for
    // The real Vuetify overlay to position itself against
    await mountSuspended(MessageModelMessageConfirmDeleteDialog, { shallow: true });
    // The message list is keyed by the room in the route, so a list only exists once one is current. Set after
    // Mounting, which resets the route, and through triggerRef because currentRoute is a shallowRef
    const router = useRouter();
    router.currentRoute.value.params.id = roomId;
    triggerRef(router.currentRoute);
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const messageDialogStore = useMessageDialogStore();
    const { deletingRowKey } = storeToRefs(messageDialogStore);
    const newMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    items.value = [newMessage];
    deletingRowKey.value = newMessage.rowKey;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(deletingRowKey.value).toBe("");
  });

  // A rejected delete owes back the row it took out and nothing else — the timeline also receives subscription
  // Pushes, so reinstating the copy this write was issued with drops whatever arrived while it was in flight
  test("restores only its own message when the delete is rejected", async () => {
    expect.hasAssertions();

    let signalDeleteRequested = noop;
    const deleteRequested = new Promise<void>((resolve) => {
      signalDeleteRequested = resolve;
    });
    let releaseDelete = noop;
    const deleteReleased = new Promise<void>((resolve) => {
      releaseDelete = resolve;
    });
    server.use(
      trpcMsw.message.deleteMessage.mutation(async () => {
        signalDeleteRequested();
        await deleteReleased;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "rejected" });
      }),
    );
    const component = await mountSuspended(MessageModelMessageConfirmDeleteDialog, { shallow: true });
    const router = useRouter();
    router.currentRoute.value.params.id = roomId;
    triggerRef(router.currentRoute);
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const userStore = useUserStore();
    const { storeUser } = userStore;
    // The dialog renders only once the message's author resolves, and the delete is emitted from it
    storeUser(creator);
    const messageDialogStore = useMessageDialogStore();
    const { deletingRowKey } = storeToRefs(messageDialogStore);
    const deletedMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    items.value = [deletedMessage];
    deletingRowKey.value = deletedMessage.rowKey;
    await flushPromises();

    component.getComponent(StyledDeleteFormDialog).vm.$emit("delete", noop);
    await deleteRequested;
    // A message a subscription delivered while the delete was in flight
    const arrivedMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    items.value = [arrivedMessage];
    releaseDelete();
    await flushPromises();

    expect(items.value.map(({ rowKey }) => rowKey)).toStrictEqual([deletedMessage.rowKey, arrivedMessage.rowKey]);
  });
});
