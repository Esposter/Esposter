import { useRoomObject } from "#server/composables/realtime/useRoomObject";

type RoomObject = ReturnType<typeof useRoomObject>;

// The one fan-out a read across rooms makes: each named room's object is asked once, in parallel, and its answer is
// keyed by the room's id. A room named twice is asked once. The merge that orders the answers is the caller's, since
// the order is the read's own: a sent message's index order, or a search's rank
export const fanOutRoomReads = async <T>(
  roomIds: string[],
  read: (roomObject: RoomObject, roomId: string) => Promise<T>,
): Promise<Map<string, T>> => {
  const entries = await Promise.all(
    [...new Set(roomIds)].map(async (roomId) => [roomId, await read(useRoomObject(roomId), roomId)] as const),
  );
  return new Map(entries);
};
