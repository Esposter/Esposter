// @vitest-environment nuxt
import MessageModelMessageConfirmPinDialog from "@/components/Message/Model/Message/ConfirmPinDialog.vue";
import StyledDialog from "@/components/Styled/Dialog.vue";
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

describe("messageModelMessageConfirmPinDialog", () => {
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
    await mountSuspended(MessageModelMessageConfirmPinDialog, { shallow: true });
    // The message list is keyed by the room in the route, so a list only exists once one is current. Set after
    // Mounting, which resets the route, and through triggerRef because currentRoute is a shallowRef
    const router = useRouter();
    router.currentRoute.value.params.id = roomId;
    triggerRef(router.currentRoute);
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const messageDialogStore = useMessageDialogStore();
    const { pinningRowKey } = storeToRefs(messageDialogStore);
    const newMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    items.value = [newMessage];
    pinningRowKey.value = newMessage.rowKey;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(pinningRowKey.value).toBe("");
  });

  // What a rejected pin owes back is read as the write is sent, never assumed: another moderator's pin can land
  // Between the dialog opening and the confirm, and a hard-coded unpin then drops a pin the server still has
  test("leaves an already pinned message pinned when the pin is rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.message.pinMessage.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "rejected" });
      }),
    );
    const component = await mountSuspended(MessageModelMessageConfirmPinDialog, { shallow: true });
    const router = useRouter();
    router.currentRoute.value.params.id = roomId;
    triggerRef(router.currentRoute);
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const userStore = useUserStore();
    const { storeUser } = userStore;
    // The dialog renders only once the message's author resolves, and the confirm is emitted from it
    storeUser(creator);
    const messageDialogStore = useMessageDialogStore();
    const { pinningRowKey } = storeToRefs(messageDialogStore);
    const pinnedMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    items.value = [pinnedMessage];
    pinningRowKey.value = pinnedMessage.rowKey;
    await flushPromises();
    // The pin a subscription delivered while the dialog was open
    pinnedMessage.isPinned = true;

    component.getComponent(StyledDialog).vm.$emit("confirm", noop);
    await flushPromises();

    expect(pinnedMessage.isPinned).toBe(true);
  });
});
