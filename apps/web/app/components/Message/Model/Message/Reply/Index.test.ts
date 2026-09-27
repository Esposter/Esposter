// @vitest-environment nuxt
import type { MessageEntity } from "@esposter/db-schema";

import MessageModelMessageReply from "@/components/Message/Model/Message/Reply/Index.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { useReplyStore } from "@/store/message/input/reply";
import { useUserStore } from "@/store/message/user";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelMessageReply", () => {
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const message = "message";
  // The preview of one replied message, read with `currentRoomId` on screen
  const readPreviewText = async (repliedMessage: MessageEntity, currentRoomId: string) => {
    const component = await mountSuspended(MessageModelMessageReply, {
      props: { roomId, rowKey: repliedMessage.rowKey },
    });
    setCurrentRoomId(currentRoomId);
    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser(createUser({ id: userId }));
    const replyStore = useReplyStore();
    const { getReplyMapRef } = replyStore;
    getReplyMapRef(roomId).value.set(repliedMessage.rowKey, repliedMessage);
    await flushPromises();
    return component.find(".rich-text-content").text();
  };

  // The thread pane renders its room's messages beside whichever room is on screen, so the preview reads the
  // Replied message out of the room it names rather than the current one
  test("previews the replied message from the room it names", async () => {
    expect.hasAssertions();

    const repliedMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });

    await expect(readPreviewText(repliedMessage, otherRoomId)).resolves.toBe(message);
  });

  // A system line is written by the server with a member's name in it verbatim, never through the sanitizer, so a
  // Name that is markup must reach the preview as the text it is
  test("previews a server-written line as text", async () => {
    expect.hasAssertions();

    const markup = "<b>b</b>";
    const repliedMessage = createMessageEntity({ message: markup, roomId, type: MessageType.System, userId });

    await expect(readPreviewText(repliedMessage, roomId)).resolves.toBe(markup);
  });
});
