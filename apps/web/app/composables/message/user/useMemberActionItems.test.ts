// @vitest-environment nuxt
import { useMemberActionItems } from "@/composables/message/user/useMemberActionItems";
import { useSession } from "@/services/auth/authClient.test";
import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { createRoom } from "@/services/message/room/createRoom.test";
import { createUser } from "@/services/message/user/createUser.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";
import { useFriendStore } from "@/store/message/user/friend";
import { RoomPermission } from "@esposter/db-schema";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useMemberActionItems, () => {
  const { trpcMsw } = setupMswTrpc();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const member = { ...createUser(), displayName: "" };
  const name = "name";
  const position = 1;
  const displayNameTitle = "Display name";

  // The actor's permissions are read the way the room reads them, so the item's gate is the one the room runs
  const setupActor = async (permissions: bigint) => {
    trpcMsw.role.readMyPermissions.query(() => [
      { isRoomOwner: false, permissions, roomId, topRolePosition: position + 1 },
    ]);
    await useRoleStore().readMyPermissions({ roomIds: [roomId] });
  };
  const setupTargetRole = (targetUserId: string) => {
    useRoleStore().setMemberRoles(roomId, targetUserId, [createRoomRole({ position, roomId })]);
  };

  beforeEach(() => {
    useSession.mockReturnValue(ref({ data: { user: { id: userId } } }));
  });

  // A direct message is only ever opened with a friend, so a friend's lead action is messaging them
  test("leads a friend with messaging them", () => {
    expect.hasAssertions();

    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    friends.value = [member];
    const { friendItem } = useMemberActionItems(member, "", vi.fn<() => void>());

    expect(friendItem.value?.title).toBe("Message");
  });

  test("leads anyone else with adding them", () => {
    expect.hasAssertions();

    const { friendItem } = useMemberActionItems(member, "", vi.fn<() => void>());

    expect(friendItem.value?.title).toBe("Add friend");
  });

  // Nothing a member does to another applies to themselves, so their own row offers only what is not an act on them
  test("offers the reader no friend or moderation action on themselves", () => {
    expect.hasAssertions();

    const { friendItem, moderationItems } = useMemberActionItems(
      { ...createUser({ id: userId }), displayName: "" },
      crypto.randomUUID(),
      vi.fn<() => void>(),
    );

    expect(friendItem.value).toBeUndefined();
    expect(moderationItems.value).toStrictEqual([]);
  });

  test("offers a holder of the display names permission the action for a member they outrank", async () => {
    expect.hasAssertions();

    await setupActor(RoomPermission.ManageDisplayNames);
    setupTargetRole(member.id);
    const { moderationItems } = useMemberActionItems(member, roomId, vi.fn<() => void>());

    expect(moderationItems.value.map(({ title }) => title)).toContain(displayNameTitle);
  });

  test("hides the display name action from a member who holds no room permission", async () => {
    expect.hasAssertions();

    await setupActor(0n);
    setupTargetRole(member.id);
    const { moderationItems } = useMemberActionItems(member, roomId, vi.fn<() => void>());

    expect(moderationItems.value.map(({ title }) => title)).not.toContain(displayNameTitle);
  });

  // The owner holds no role row, so a holder outranks them on position alone. Owner immunity is what hides the item
  // Here, and a client that checked position only would offer it
  test("hides the display name action from the room owner", async () => {
    expect.hasAssertions();

    const owner = { ...createUser(), displayName: "" };
    useRoomStore().pushRooms({ ...createRoom(name), id: roomId, userId: owner.id });
    await setupActor(RoomPermission.ManageDisplayNames);
    useRoleStore().setMemberRoles(roomId, owner.id, []);
    const { moderationItems } = useMemberActionItems(owner, roomId, vi.fn<() => void>());

    expect(moderationItems.value.map(({ title }) => title)).not.toContain(displayNameTitle);
  });

  test("hides the display name action from the holder's own row", async () => {
    expect.hasAssertions();

    await setupActor(RoomPermission.ManageDisplayNames);
    setupTargetRole(userId);
    const { moderationItems } = useMemberActionItems(
      { ...createUser({ id: userId }), displayName: "" },
      roomId,
      vi.fn<() => void>(),
    );

    expect(moderationItems.value.map(({ title }) => title)).not.toContain(displayNameTitle);
  });
});
