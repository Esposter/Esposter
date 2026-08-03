// @vitest-environment nuxt
import type { RoomInMessage, UserToRoomInMessage } from "@esposter/db-schema";

import MessageModelRoomSettingsTypeProfileIndex from "@/components/Message/Model/Room/Settings/Type/Profile/Index.vue";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";
import { MimeCategory, NotificationType, RoomType } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { VTextField } from "vuetify/components";

describe("messageModelRoomSettingsTypeProfileIndex", () => {
  const server = setupMswTrpc();
  const userId = crypto.randomUUID();
  const room: RoomInMessage = {
    allowedMimeCategories: [MimeCategory.Audio, MimeCategory.Document, MimeCategory.Image, MimeCategory.Video],
    categoryId: null,
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    id: crypto.randomUUID(),
    image: "",
    isReadOnly: false,
    maxFileSizeBytes: null,
    name: "name",
    participantKey: null,
    slowmodeMs: null,
    topic: "",
    type: RoomType.Room,
    updatedAt: new Date("1970-01-01"),
    userId,
  };
  const userToRoom: UserToRoomInMessage = {
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    isHidden: false,
    lastMessageAt: null,
    mentionCount: 0,
    nickname: "",
    notificationType: NotificationType.DirectMessage,
    roomId: room.id,
    timeoutUntil: null,
    updatedAt: new Date("1970-01-01"),
    userId,
  };

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
    // The component mounts into the nuxt app's pinia, so seed the store it reads rather than a local one
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
