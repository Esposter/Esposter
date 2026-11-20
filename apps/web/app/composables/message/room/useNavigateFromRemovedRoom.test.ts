// @vitest-environment nuxt
import { useNavigateFromRemovedRoom } from "#src/composables/message/room/useNavigateFromRemovedRoom";
import { useReadRooms } from "#src/composables/message/room/useReadRooms";
import { useSession } from "#src/services/auth/authClient.test";
import { createRoom } from "#src/services/message/room/createRoom.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { setCurrentRoomId } from "#src/services/message/room/setCurrentRoomId.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { RoutePath } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useNavigateFromRemovedRoom, () => {
  const { trpcMsw } = setupMswTrpc();
  const room = createRoom("name");
  const otherRoom = createRoom("otherName");
  const session = { user: { id: v7() } };

  // The list shows a room while the reader's membership of it is live, so the list is read the way the page reads it
  const readListedRoom = async () => {
    useSession.mockImplementation((fetcher) => (fetcher ? { data: ref(session) } : ref({ data: session })));
    trpcMsw.room.readRooms.query(() => ({ items: [{ ...room, displayName: room.name }], nextCursor: "" }));
    trpcMsw.userToRoom.readMyUsersToRooms.query(() => [createUserToRoom({ roomId: room.id, userId: session.user.id })]);
    trpcMsw.role.readMyPermissions.query(() => []);
    trpcMsw.role.readRoles.query(() => []);
    const { readRooms } = await useReadRooms();
    await readRooms();
  };
  const watchPaths = () => {
    const paths: string[] = [];
    useRouter().afterEach((to) => {
      paths.push(to.path);
    });
    return paths;
  };
  const tombstoneMembership = (roomId: string) =>
    createUserToRoom({ deletedAt: new Date(), roomId, userId: session.user.id, version: 1 });

  // A leave, a kick or a room delete reaches the reader's tabs as the tombstone of its membership. The room is left at
  // once, and the reader is taken off it once, since the tombstone arrives once
  test("navigates off the current room once when its membership tombstone arrives", async () => {
    expect.hasAssertions();

    await readListedRoom();
    setCurrentRoomId(room.id);
    const paths = watchPaths();
    effectScope().run(() => useNavigateFromRemovedRoom());
    useUserToRoomStore().arriveUserToRooms([tombstoneMembership(room.id)]);
    await flushPromises();
    await flushPromises();

    expect(paths).toStrictEqual([RoutePath.MessagesIndex]);
  });

  // A room the list never showed has no removal to follow, so opening one it has no membership of is not a navigation
  test("does not navigate off a room the list never showed", async () => {
    expect.hasAssertions();

    await readListedRoom();
    setCurrentRoomId(otherRoom.id);
    const paths = watchPaths();
    effectScope().run(() => useNavigateFromRemovedRoom());
    useUserToRoomStore().arriveUserToRooms([tombstoneMembership(otherRoom.id)]);
    await flushPromises();

    expect(paths).toStrictEqual([]);
  });
});
