// @vitest-environment nuxt
import MessageModelMessageConfirmPinDialog from "@/components/Message/Model/Message/ConfirmPinDialog.vue";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelMessageConfirmPinDialog", () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";

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
    const { items } = storeToRefs(useDataStore());
    const { pinningRowKey } = storeToRefs(useMessageDialogStore());
    const newMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    items.value = [newMessage];
    pinningRowKey.value = newMessage.rowKey;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(pinningRowKey.value).toBe("");
  });
});
