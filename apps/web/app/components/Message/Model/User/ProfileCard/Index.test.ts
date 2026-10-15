// @vitest-environment nuxt
import MessageModelUserProfileCard from "@/components/Message/Model/User/ProfileCard/Index.vue";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("messageModelUserProfileCard", () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const user = createUser({ name: "globalName" });
  const displayName = "displayName";

  // The member row this card pops out of resolves the displayName, so a card reading the global name renames the
  // Person under the cursor the moment the popout opens
  test("names the member the way its room does", async () => {
    expect.hasAssertions();

    trpcMsw.room.readMutualRooms.query(() => []);
    const component = await mountSuspended(MessageModelUserProfileCard, { props: { user } });
    setCurrentRoomId(roomId);
    const userToRoomStore = useUserToRoomStore();
    const { setDisplayName } = userToRoomStore;
    setDisplayName(roomId, user.id, displayName);
    await flushPromises();

    expect(component.text()).toContain(displayName);
    expect(component.text()).not.toContain(user.name);
  });
});
