// @vitest-environment nuxt
import { MessageHookMap } from "@/services/message/MessageHookMap";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { useDataStore } from "@/store/message/data";
import { useReplyStore } from "@/store/message/input/reply";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useReplyStore, () => {
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
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
    const repliedMessage = createMessageEntity({ roomId, type: MessageType.Message, userId });
    getSlice(roomId).items.value.push(repliedMessage);
    setCurrentRoomId(otherRoomId);
    await MessageHookMap[Operation.Create].run(
      createMessageEntity({ replyRowKey: repliedMessage.rowKey, roomId, type: MessageType.Message, userId }),
    );

    expect(getReplyMapRef(roomId).value.get(repliedMessage.rowKey)?.rowKey).toBe(repliedMessage.rowKey);
  });
});
