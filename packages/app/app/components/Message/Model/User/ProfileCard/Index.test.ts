// @vitest-environment nuxt
import MessageModelUserProfileCard from "@/components/Message/Model/User/ProfileCard/Index.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelUserProfileCard", () => {
  const server = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const user = createUser({ name: "globalName" });
  const nickname = "nickname";

  // The member row this card pops out of resolves the nickname, so a card reading the global name renames the
  // Person under the cursor the moment the popout opens
  test("names the member the way its room does", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.room.readMutualRooms.query(() => []));
    const component = await mountSuspended(MessageModelUserProfileCard, { props: { user } });
    setCurrentRoomId(roomId);
    const userToRoomStore = useUserToRoomStore();
    const { setNickname } = userToRoomStore;
    setNickname(roomId, user.id, nickname);
    await flushPromises();

    expect(component.text()).toContain(nickname);
    expect(component.text()).not.toContain(user.name);
  });
});
