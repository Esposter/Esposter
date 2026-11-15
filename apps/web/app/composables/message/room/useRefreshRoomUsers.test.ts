// @vitest-environment nuxt
import { useRefreshRoomUsers } from "#src/composables/message/room/useRefreshRoomUsers";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserStore } from "#src/store/message/user/index";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useRefreshRoomUsers, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const user = createUser({ name: "accountName" });

  // A member the room already holds is read again too, since a name the account has changed is only in the read. The
  // Read that filled the room skips such a member, so a renamed one would keep the name the room read when they joined
  test("replaces the copy a room holds of a member, so a renamed member shows the name and image their account has now", async () => {
    expect.hasAssertions();

    const userStore = useUserStore();
    userStore.storeUsers([user]);
    userStore.storeRoomMembers(roomId, [{ ...user, displayName: user.name }]);
    const renamedUser = { ...user, image: "a", name: "renamedAccount" };
    trpcMsw.room.readUsersByIds.query(() => [{ ...renamedUser, displayName: renamedUser.name, isMember: true }]);

    await useRefreshRoomUsers()(roomId, () => false);

    expect(userStore.getRoomMemberMap(roomId)?.get(user.id)?.displayName).toBe(renamedUser.name);
    expect(userStore.userMap.get(user.id)).toStrictEqual({
      ...renamedUser,
      displayName: renamedUser.name,
      isMember: true,
    });
  });
});
