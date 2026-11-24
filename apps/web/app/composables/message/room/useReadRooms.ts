import type { RoomInMessage } from "@esposter/db-schema";

import { requirePartitionKey } from "#src/services/message/requirePartitionKey";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";
import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { chunk, MAX_READ_LIMIT } from "@esposter/shared";

export const useReadRooms = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { arriveRooms, readItems, readMoreItems } = roomStore;
  const { currentRoomId, rooms } = storeToRefs(roomStore);
  const roleStore = useRoleStore();
  const { readMyPermissions, readRoles } = roleStore;
  const userToRoomStore = useUserToRoomStore();
  const { markMyUserToRoomsLoaded } = userToRoomStore;
  const readMyUsersToRooms = useReadMyUsersToRooms();
  const { data: session } = await useAuthSession();
  // A room row is not a room: the sidebar renders a displayName, the reader's own standing and the room's roles
  // Beside every name. Both paths that produce a page go through here rather than restating the fan-out, which
  // Is how a scrolled page comes to render rows the first one does not
  const readRoomMetadata = async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;
    await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions({ roomIds }), readRoles({ roomIds })]);
  };
  // The page's rows are held on the overlay as they answer, and the page keeps only their ids for paging. A row's
  // Display name is the server's join, which the room list never shows, so it is left off the held row
  const readRoomPage = async (
    readPage: () => Promise<{ items: ({ displayName: string } & RoomInMessage)[]; nextCursor: string }>,
  ) => {
    const page = await readPage();
    arriveRooms(page.items.map(({ displayName: _displayName, ...room }) => room));
    await readRoomMetadata(page.items.map(({ id }) => id));
    markMyUserToRoomsLoaded();
    return { ...page, items: page.items.map(({ id }) => ({ id })) };
  };
  // The page names only the rooms that are live, so a room the list shows that the page leaves out may have been
  // Removed while the reader was offline. Absence never removes a row, so each one's membership is read, and its answer
  // Is the removal's tombstone, which takes the room off the list
  const readUnlistedMemberships = (listedRoomIds: RoomInMessage["id"][]) => {
    const listedRoomIdSet = new Set(listedRoomIds);
    const unlistedRoomIds = rooms.value.map(({ id }) => id).filter((roomId) => !listedRoomIdSet.has(roomId));
    return Promise.all(chunk(unlistedRoomIds, MAX_READ_LIMIT).map((roomIds) => readMyUsersToRooms(roomIds)));
  };
  // The first page is the resume read: it runs on mount and on a topic change, so a reader who was offline is answered
  // Its removals by it
  const readRooms = () => {
    requirePartitionKey(session.value?.user.id, readRooms.name);
    return readItems(async () => {
      const page = await readRoomPage(() =>
        $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {}),
      );
      await readUnlistedMemberships(page.items.map(({ id }) => id));
      return page;
    });
  };
  const readMoreRooms = (onComplete: () => void) => {
    requirePartitionKey(session.value?.user.id, readMoreRooms.name);
    return readMoreItems((cursor) => readRoomPage(() => $trpc.room.readRooms.query({ cursor })), onComplete);
  };
  return { readMoreRooms, readRooms };
};
