// @vitest-environment nuxt
import MessageModelMessageForwardRoomDialog from "@/components/Message/Model/Message/Forward/RoomDialog.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useDataStore } from "@/store/message/data";
import { useForwardStore } from "@/store/message/input/forward";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelMessageForwardRoomDialog", () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  // The behaviour matrix for a singleton dialog whose item leaves its list lives in useSingletonDialog's own
  // Test; here only that this dialog resolves through the primitive rather than a computed of its own —
  // Otherwise the target survives its message leaving the timeline and the dialog re-opens over it by itself
  test("drops the target when its message leaves the timeline", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.room.readRooms.query(() => ({ hasMore: false, items: [], nextCursor: "" })));
    // Shallow because the reconciliation under test lives in setup — the overlay DOM has no bearing on it
    await mountSuspended(MessageModelMessageForwardRoomDialog, { shallow: true });
    setCurrentRoomId(roomId);
    const dataStore = useDataStore();
    const { items } = storeToRefs(dataStore);
    const forwardStore = useForwardStore();
    const { rowKey } = storeToRefs(forwardStore);
    const message = createMessageEntity({ roomId, type: MessageType.Message, userId });
    items.value = [message];
    rowKey.value = message.rowKey;
    await flushPromises();
    items.value = [];
    await flushPromises();

    expect(rowKey.value).toBe("");
  });
});
