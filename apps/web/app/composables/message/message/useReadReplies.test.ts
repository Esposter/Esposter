// @vitest-environment nuxt
import { useReadReplies } from "#src/composables/message/message/useReadReplies";
import { createMessage } from "#src/services/message/message/createMessage.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useReplyStore } from "#src/store/message/input/reply";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadReplies, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();

  // A reply read answered with an older version than the copy an edit already wrote must not replace that copy
  test("keeps a reply copy at a newer version than the row the read answers with", async () => {
    expect.hasAssertions();

    const message = createMessage(roomId);
    trpcMsw.message.readMessagesByIds.query(() => [{ ...message, message: "older" }]);
    let replyStore: ReturnType<typeof useReplyStore>;
    let readReplies: ReturnType<typeof useReadReplies>;
    await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setCurrentRoomId(roomId);
          replyStore = useReplyStore();
          readReplies = useReadReplies();
        },
      }),
    );
    replyStore.getReplyMapRef(roomId).value.set(message.id, { ...message, message: "newer", version: 1 });
    await readReplies(roomId, [message.id]);

    expect(replyStore.getReplyMapRef(roomId).value.get(message.id)?.message).toBe("newer");
  });
});
