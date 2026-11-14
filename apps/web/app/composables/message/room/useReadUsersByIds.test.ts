// @vitest-environment nuxt
import { useReadUsersByIds } from "@/composables/message/room/useReadUsersByIds";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useUserStore } from "@/store/message/user";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadUsersByIds, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = v7();
  const user = createUser({ name: "accountName" });

  // A user who has left is not a member, so the room keeps no row for them and their name comes from their account. A
  // Rejoin is then never held to a name the room cached while they were away
  test("keeps a user who has left out of the room's members", async () => {
    expect.hasAssertions();

    trpcMsw.room.readUsersByIds.query(() => [{ ...user, displayName: user.name, isMember: false }]);
    await useReadUsersByIds()(roomId, [user.id]);

    const userStore = useUserStore();
    expect(userStore.getRoomMemberMap(roomId)?.has(user.id)).toBe(false);
    expect(userStore.userMap.get(user.id)?.name).toBe(user.name);
  });
});
