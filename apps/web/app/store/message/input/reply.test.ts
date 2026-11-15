// @vitest-environment nuxt
import { createOptimisticMessage } from "#src/services/message/createOptimisticMessage";
import { MessageHookMap } from "#src/services/message/MessageHookMap";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { useDataStore } from "#src/store/message/data";
import { useReplyStore } from "#src/store/message/input/reply";
import { MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useReplyStore, () => {
  const roomId = v7();
  const otherRoomId = v7();
  const userId = v7();

  beforeEach(() => {
    setCurrentRoomId(roomId);
  });

  // A message's Create hooks run behind an await on the incoming path, so the reader can have opened another room
  // By then — the replied-to message is looked up and filed in the room the reply was sent to
  test("files a reply's target under the room the reply is in", async () => {
    expect.hasAssertions();

    const dataStore = useDataStore();
    const { getSlice } = dataStore;
    const replyStore = useReplyStore();
    const { getReplyMapRef } = replyStore;
    const repliedMessage = createOptimisticMessage({ roomId, type: MessageType.Message }, userId);
    getSlice(roomId).items.value.push(repliedMessage);
    setCurrentRoomId(otherRoomId);
    await MessageHookMap[Operation.Create].run(
      createOptimisticMessage({ replyToId: repliedMessage.id, roomId, type: MessageType.Message }, userId),
    );

    expect(getReplyMapRef(roomId).value.get(repliedMessage.id)?.id).toBe(repliedMessage.id);
  });

  // A quoted message read from the server is a copy of the room's row, so an edit of the quoted message reaches the
  // Quote through the hook rather than the quote holding the text from before the edit
  test("takes an edit to a quoted message", async () => {
    expect.hasAssertions();

    const replyStore = useReplyStore();
    const { getReplyMapRef } = replyStore;
    const quotedMessage = { ...createOptimisticMessage({ roomId, type: MessageType.Message }, userId), id: 1 };
    getReplyMapRef(roomId).value.set(quotedMessage.id, { ...quotedMessage });
    await MessageHookMap[Operation.Update].run({ id: quotedMessage.id, message: "edited", roomId });

    expect(getReplyMapRef(roomId).value.get(quotedMessage.id)?.message).toBe("edited");
  });
});
