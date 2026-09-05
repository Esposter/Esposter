// @vitest-environment nuxt
import MessageModelRoomSettingsTypeProfileIndex from "@/components/Message/Model/Room/Settings/Type/Profile/Index.vue";
import { createRoom } from "@/services/message/room/createRoom.test";
import { createUserToRoom } from "@/services/message/room/createUserToRoom.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { VTextField } from "vuetify/components";

describe("messageModelRoomSettingsTypeProfileIndex", () => {
  const server = setupMswTrpc();
  const room = createRoom("name");
  const userToRoom = createUserToRoom({ roomId: room.id, userId: room.userId });

  // The field emits save from blur and from Enter, so a nickname committed with Enter and then blurred writes
  // The same value twice — every one of those writes is a round trip the queue now runs one after the other
  test("writes once when the field saves from both blur and Enter", async () => {
    expect.hasAssertions();

    const nickname = "nickname";
    let updateCount = 0;
    server.use(
      trpcMsw.userToRoom.updateUserToRoom.mutation(({ input }) => {
        updateCount += 1;
        return { ...userToRoom, nickname: input.nickname ?? userToRoom.nickname };
      }),
    );
    const userToRoomStore = useUserToRoomStore();
    const { setMyUserToRoom } = userToRoomStore;
    setMyUserToRoom(room.id, userToRoom);

    const component = await mountSuspended(MessageModelRoomSettingsTypeProfileIndex, { props: { room } });
    const textField = component.getComponent(VTextField);
    textField.vm.$emit("update:model-value", nickname);
    await flushPromises();
    textField.vm.$emit("blur");
    await flushPromises();
    textField.vm.$emit("blur");
    await flushPromises();

    expect(updateCount).toBe(1);
  });
});
