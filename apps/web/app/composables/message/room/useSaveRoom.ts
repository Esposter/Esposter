import type { RoomInMessage, UpdateRoomInput } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { useRoomStore } from "#src/store/message/room/index";

// Every room settings panel saves a different slice of the same row through the same write, so the save lives here once
export const useSaveRoom = (room: MaybeRefOrGetter<RoomInMessage>) => {
  const roomStore = useRoomStore();
  const { updateRoom } = roomStore;
  return (fields: Except<UpdateRoomInput, "id">) => {
    updateRoom({ ...fields, id: toValue(room).id });
  };
};
