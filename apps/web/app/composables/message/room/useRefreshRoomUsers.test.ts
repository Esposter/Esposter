// @vitest-environment nuxt
import type { UserInRoom } from "#shared/models/db/room/UserInRoom";

import { useRefreshRoomUsers } from "#src/composables/message/room/useRefreshRoomUsers";
import { setRoomUsers } from "#src/services/message/room/setRoomUsers";
import { createUser } from "#src/services/message/user/createUser.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserStore } from "#src/store/message/user/index";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe(useRefreshRoomUsers, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const emptyRoomId = v7();
  const user = createUser({ name: "accountName" });

  // A room with no member and no loaded author still reads once, with no ids. That read is what the room's topic watch
  // Is taken from, so a member who joins later is watched from the start rather than only once the room has someone to
  // Read
  test("reads an empty room once with no ids, so its topic watch is taken before anyone is in it", async () => {
    expect.hasAssertions();

    const readUsersByIdsQuery = vi.fn<(options: { input: { roomId: string; userIds: string[] } }) => UserInRoom[]>(
      () => [],
    );
    trpcMsw.room.readUsersByIds.query(readUsersByIdsQuery);

    await expect(useRefreshRoomUsers()(emptyRoomId)).resolves.toStrictEqual([]);
    expect(takeOne(readUsersByIdsQuery.mock.calls)[0].input).toStrictEqual({ roomId: emptyRoomId, userIds: [] });
  });

  // A member the room already holds is read again too, since a name the account has changed is only in the read. The
  // Read that filled the room skips such a member, so a renamed one would keep the name the room read when they joined
  test("replaces the copy a room holds of a member, so a renamed member shows the name and image their account has now", async () => {
    expect.hasAssertions();

    const userStore = useUserStore();
    const { userMap } = storeToRefs(userStore);
    const { getRoomMemberMap, storeRoomMembers, storeUsers } = userStore;
    storeUsers([user]);
    storeRoomMembers(roomId, [{ ...user, displayName: user.name }]);
    const renamedUser = { ...user, image: "a", name: "renamedAccount" };
    trpcMsw.room.readUsersByIds.query(() => [{ ...renamedUser, displayName: renamedUser.name, isMember: true }]);

    setRoomUsers(roomId, await useRefreshRoomUsers()(roomId));

    expect(getRoomMemberMap(roomId)?.get(user.id)?.displayName).toBe(renamedUser.name);
    expect(userMap.value.get(user.id)).toStrictEqual({ ...renamedUser, displayName: renamedUser.name, isMember: true });
  });
});
