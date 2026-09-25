// @vitest-environment nuxt
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

  // The thread pane renders its room's messages beside whichever room is on screen, so the preview reads the
  // Replied message out of the room it names rather than the current one
  test("previews the replied message from the room it names", async () => {
    expect.hasAssertions();

    const repliedMessage = createMessageEntity({ message, roomId, type: MessageType.Message, userId });
    const component = await mountSuspended(MessageModelMessageReply, {
      props: { roomId, rowKey: repliedMessage.rowKey },
    });
    setCurrentRoomId(otherRoomId);
    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser(createUser({ id: userId }));
    const replyStore = useReplyStore();
    const { getReplyMapRef } = replyStore;
    getReplyMapRef(roomId).value.set(repliedMessage.rowKey, repliedMessage);
    await flushPromises();

    expect(component.find(".rich-text-content").text()).toBe(message);
  });
});
