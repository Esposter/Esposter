// @vitest-environment nuxt
import { useCreator } from "@/composables/message/room/useCreator";
import { UNKNOWN_USER_NAME } from "@/services/message/constants";
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

  // An offline webhook's app user is not cached, so the identity its message carries is what names it
  test("names a webhook the app user cache does not hold from the app user its message carries", () => {
    expect.hasAssertions();

    const appUser = { id: crypto.randomUUID(), image: "", name: "appUserName" };
    const message = createMessageEntity({ appUser, roomId, type: MessageType.Webhook });
    const creator = useCreator(() => message);

    expect(creator.value?.name).toBe(appUser.name);
  });

  // A member who has left the room is named by their account. An author nobody can resolve is drawn under the
  // Placeholder rather than dropped, so the message they wrote still shows
  test("names an author nobody can resolve with the placeholder", () => {
    expect.hasAssertions();

    const message = createMessageEntity({ roomId, type: MessageType.Message, userId: crypto.randomUUID() });
    const creator = useCreator(() => message);

    expect(creator.value).toStrictEqual({ id: message.userId, image: "", name: UNKNOWN_USER_NAME });
  });
});
