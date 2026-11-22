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

// A navigation lands after the page resolves, which takes more turns than a flush, so the watch resolves once the
// Messages index has landed and the test waits on that rather than on a fixed number of flushes
const watchPaths = () => {
  const paths: string[] = [];
  const { promise: isLanded, resolve: onLanded } = Promise.withResolvers<true>();
  useRouter().afterEach((to) => {
    paths.push(to.path);
    if (to.path === RoutePath.MessagesIndex) onLanded(true);
  });
  return { isLanded, paths };
};

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
  const tombstoneMembership = (roomId: string) =>
    createUserToRoom({ deletedAt: new Date(0), roomId, userId: session.user.id, version: 1 });

  // A leave, a kick or a room delete reaches the reader's tabs as the tombstone of its membership. The room leaves the
  // List at once, and the reader is taken off it a single time, since the tombstone arrives once
  test("navigates off the current room once when its membership tombstone arrives", async () => {
    expect.hasAssertions();

    await readListedRoom();
    setCurrentRoomId(room.id);
    const { isLanded, paths } = watchPaths();
    effectScope().run(() => {
      useNavigateFromRemovedRoom();
    });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([tombstoneMembership(room.id)]);
    await isLanded;
    await flushPromises();

    expect(paths).toStrictEqual([RoutePath.MessagesIndex]);
  });

  // A room the list never showed has no removal to follow, so opening one it has no membership of is not a navigation
  test("does not navigate off a room the list never showed", async () => {
    expect.hasAssertions();

    await readListedRoom();
    setCurrentRoomId(otherRoom.id);
    const { paths } = watchPaths();
    effectScope().run(() => {
      useNavigateFromRemovedRoom();
    });
    const userToRoomStore = useUserToRoomStore();
    const { arriveUserToRooms } = userToRoomStore;
    arriveUserToRooms([tombstoneMembership(otherRoom.id)]);
    await flushPromises();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(paths).toStrictEqual([]);
  });
});
