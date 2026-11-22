// @vitest-environment nuxt
import MessageContentCallJoinNoticeKnockerItem from "#src/components/Message/Content/Call/JoinNotice/KnockerItem.vue";
import { createUser } from "#src/services/message/user/createUser.test";
import { useCallStore } from "#src/store/message/room/call/index";
import { useUserStore } from "#src/store/message/user/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageContentCallJoinNoticeKnockerItem", () => {
  // A knocker is named as the room names them, as the joiner notice is, rather than by the account name
  test("names the knocker by the room display name", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const user = createUser();
    const callStore = useCallStore();
    const { callRoomId } = storeToRefs(callStore);
    callRoomId.value = roomId;
    const userStore = useUserStore();
    const { storeRoomMembers } = userStore;
    storeRoomMembers(roomId, [{ ...user, displayName: "displayName" }]);
    const component = await mountSuspended(MessageContentCallJoinNoticeKnockerItem, {
      props: {
        knocker: {
          id: v7(),
          image: user.image,
          isCameraEnabled: false,
          isHandRaised: false,
          isMuted: false,
          name: user.name,
          userId: user.id,
        },
      },
    });

    expect(component.text()).toContain("displayName wants to join");
  });
});
