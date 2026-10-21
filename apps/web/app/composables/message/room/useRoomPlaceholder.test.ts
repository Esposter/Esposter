// @vitest-environment nuxt
import { useRoomPlaceholder } from "@/composables/message/room/useRoomPlaceholder";
import { createRoom } from "@/services/message/room/createRoom.test";
import { createUser } from "@/services/message/user/createUser.test";
import { useUserStore } from "@/store/message/user";
import { describe, expect, test } from "vitest";

describe(useRoomPlaceholder, () => {
  const user = createUser({ name: "globalName" });
  const room = { ...createRoom(""), userId: user.id };

  // A room nobody has opened this session has no member rows, so the creator's account name names it
  test("names an unopened room after the creator's account name", () => {
    expect.hasAssertions();

    const userStore = useUserStore();
    const { storeUser } = userStore;
    storeUser(user);
    const placeholder = useRoomPlaceholder(() => room);

    expect(placeholder.value).toBe(`${user.name}'s Room`);
  });

  // The creator's row in the room names it, the way the room's member list does
  test("names the room after the creator's row in that room", () => {
    expect.hasAssertions();

    const displayName = "displayName";
    const userStore = useUserStore();
    const { storeRoomMembers, storeUser } = userStore;
    storeUser(user);
    storeRoomMembers(room.id, [{ ...user, displayName }]);
    const placeholder = useRoomPlaceholder(() => room);

    expect(placeholder.value).toBe(`${displayName}'s Room`);
  });
});
