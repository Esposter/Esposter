// @vitest-environment nuxt
import MessageContentCallJoinNotice from "#src/components/Message/Content/Call/JoinNotice/Index.vue";
import { createUser } from "#src/services/message/user/createUser.test";
import { useCallStore } from "#src/store/message/room/call/index";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { useUserStore } from "#src/store/message/user/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("messageContentCallJoinNotice", () => {
  // The notice names a joiner as the room names them, so it reads the same as their tile in the call
  test("names the joiner by the room display name", async () => {
    expect.hasAssertions();

    const roomId = v7();
    const user = createUser();
    const callStore = useCallStore();
    const { callRoomId } = storeToRefs(callStore);
    callRoomId.value = roomId;
    const userStore = useUserStore();
    const { storeRoomMembers } = userStore;
    storeRoomMembers(roomId, [{ ...user, displayName: "displayName" }]);
    const participantStore = useParticipantStore();
    const { storeJoinedCallParticipant } = participantStore;
    storeJoinedCallParticipant(v7(), {
      deletedAt: null,
      id: v7(),
      image: user.image,
      isCameraEnabled: false,
      isHandRaised: false,
      isMuted: false,
      name: user.name,
      userId: user.id,
      version: 1,
    });
    const wrapper = await mountSuspended(MessageContentCallJoinNotice);

    expect(wrapper.text()).toContain("displayName joined the call");
  });
});
