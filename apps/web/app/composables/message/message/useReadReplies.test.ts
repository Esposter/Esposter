// @vitest-environment nuxt
import type { RoomMessage } from "@esposter/db-schema";

import { useReadReplies } from "#src/composables/message/message/useReadReplies";
import { createMessage } from "#src/services/message/message/createMessage.test";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useReplyStore } from "#src/store/message/input/reply";
import { setRouteId } from "#src/util/router/setRouteId.test";
import { Operation } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadReplies, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const mountReadReplies = () =>
    mountSuspended(
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
  // Holds the reply read until the test resolves it, and reports when the read has gone out
  const holdRead = () => {
    const read = Promise.withResolvers<RoomMessage[]>();
    const readStarted = Promise.withResolvers<void>();
    trpcMsw.message.readMessagesByIds.query(() => {
      readStarted.resolve();
      return read.promise;
    });
    return { read, readStarted };
  };

  // A reply read answered with an older version than the copy an edit already wrote must not replace that copy
  test("keeps a reply copy at a newer version than the row the read answers with", async () => {
    expect.hasAssertions();

    const message = createMessage(roomId);
    trpcMsw.message.readMessagesByIds.query(() => [{ ...message, message: "older" }]);
    const wrapper = await mountReadReplies();
    const { getReplyMapRef, readReplies } = wrapper.vm;
    getReplyMapRef(roomId).value.set(message.id, { ...message, message: "newer", version: 1 });
    await readReplies(roomId, [message.id]);

    expect(getReplyMapRef(roomId).value.get(message.id)?.message).toBe("newer");
  });

  // A reply the room deletes while its read is in flight stays out of the answer the read lands
  test("drops a reply the room deleted while the read was in flight", async () => {
    expect.hasAssertions();

    const message = createMessage(roomId);
    const { read, readStarted } = holdRead();
    const wrapper = await mountReadReplies();
    const { getReplyMapRef, readReplies } = wrapper.vm;
    const readPromise = readReplies(roomId, [message.id]);
    await readStarted.promise;
    await MessageHookMap[Operation.Delete].run({ id: message.id, roomId });
    read.resolve([message]);
    await readPromise;

    expect(getReplyMapRef(roomId).value.has(message.id)).toBe(false);
  });

  // An edit the room makes while the read is in flight lands on the answer, since the reply has no copy yet to take it
  test("takes an edit the room made while the read was in flight into the answer", async () => {
    expect.hasAssertions();

    const message = createMessage(roomId);
    const { read, readStarted } = holdRead();
    const wrapper = await mountReadReplies();
    const { getReplyMapRef, readReplies } = wrapper.vm;
    const readPromise = readReplies(roomId, [message.id]);
    await readStarted.promise;
    await MessageHookMap[Operation.Update].run({
      id: message.id,
      message: "edited",
      roomId,
      version: message.version + 1,
    });
    read.resolve([message]);
    await readPromise;

    expect(getReplyMapRef(roomId).value.get(message.id)?.message).toBe("edited");
  });
});
