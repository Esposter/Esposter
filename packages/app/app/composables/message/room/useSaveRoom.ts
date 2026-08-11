import type { UpdateRoomInput } from "#shared/models/db/room/UpdateRoomInput";
import type { Except } from "type-fest";
import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

// Every room settings panel saves a different slice of the same row through the same mutation target, so the
// Optimistic apply lives here once. The rollback restores exactly the keys the save wrote rather than the whole
// Row, so a field another client changed in the meantime is not reverted along with the rejected one.
export const useSaveRoom = (room: MaybeRefOrGetter<RoomInMessage>) => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { storeUpdateRoom } = roomStore;
  const { executeMutation } = useMutation();
  return async (fields: Except<UpdateRoomInput, "id">) => {
    const { id } = toValue(room);
    const input = { ...fields, id };
    await executeMutation(() => $trpc.room.updateRoom.mutate(input), {
      applyOptimistic: () => {
        const currentRoom = toValue(room);
        // Object.keys widens its result to string, so the row is indexed back through the input's own key type —
        // Every field an update input can name is a column of the row it is read from
        const snapshot = {
          ...(Object.fromEntries(
            Object.keys(fields).map((key) => [key, currentRoom[key as keyof RoomInMessage]]),
          ) as Partial<RoomInMessage>),
          id,
        };
        storeUpdateRoom(input);
        return () => {
          storeUpdateRoom(snapshot);
        };
      },
      key: id,
    });
  };
};
