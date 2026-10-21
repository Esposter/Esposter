// @vitest-environment nuxt
import { useCreator } from "@/composables/message/room/useCreator";
import { createUser } from "@/services/message/user/createUser.test";
import { useUserStore } from "@/store/message/user";
import { useAppUserStore } from "@/store/message/user/appUser";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { beforeEach, describe, expect, test } from "vitest";

describe(useCreator, () => {
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const displayName = "displayName";
  const user = createUser({ name: "globalName" });

  beforeEach(() => {
    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser(user);
  });

  // The member sidebar and the settings Members panel already resolve the displayName, so a timeline reading the
  // Global name makes one renamed member look like two different people inside one room
  test("names the creator the way its room does", () => {
    expect.hasAssertions();

    const userStore = useUserStore();
    const { storeRoomMembers } = userStore;
    storeRoomMembers(roomId, [{ ...user, displayName }]);
    const message = createMessageEntity({ roomId, type: MessageType.Message, userId: user.id });
    const creator = useCreator(() => message);

    expect(creator.value?.name).toBe(displayName);
  });

  // The displayName is per room, so a message from another room keeps the global name
  test("keeps the global name where the room has no member row for the creator", () => {
    expect.hasAssertions();

    const userStore = useUserStore();
    const { storeRoomMembers } = userStore;
    storeRoomMembers(otherRoomId, [{ ...user, displayName }]);
    const message = createMessageEntity({ roomId, type: MessageType.Message, userId: user.id });
    const creator = useCreator(() => message);

    expect(creator.value?.name).toBe(user.name);
  });

  // An app user is not a member of the room, so there is no member row to take its name from
  test("names a webhook creator from its app user", () => {
    expect.hasAssertions();

    const appUser = {
      createdAt: new Date(0),
      deletedAt: null,
      id: crypto.randomUUID(),
      image: "",
      name: "appUserName",
      updatedAt: new Date(0),
    };
    const appUserStore = useAppUserStore();
    const { appUserMap } = storeToRefs(appUserStore);
    appUserMap.value.set(appUser.id, appUser);
    const message = createMessageEntity({ appUser, roomId, type: MessageType.Webhook });
    const creator = useCreator(() => message);

    expect(creator.value?.name).toBe(appUser.name);
  });
});
