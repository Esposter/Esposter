// @vitest-environment nuxt
import { useReadReplies } from "#src/composables/message/message/useReadReplies";
import { createMessage } from "#src/services/message/message/createMessage.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useReplyStore } from "#src/store/message/input/reply";
import { setRouteId } from "#src/util/router/setRouteId.test";
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
    const wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          setRouteId(roomId);
          const replyStore = useReplyStore();
          const { getReplyMapRef } = replyStore;
          return { getReplyMapRef, readReplies: useReadReplies() };
        },
      }),
    );
    const { getReplyMapRef, readReplies } = wrapper.vm;
    getReplyMapRef(roomId).value.set(message.id, { ...message, message: "newer", version: 1 });
    await readReplies(roomId, [message.id]);

    expect(getReplyMapRef(roomId).value.get(message.id)?.message).toBe("newer");
  });
});
