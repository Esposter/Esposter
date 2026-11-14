import type { RoomMessage } from "@esposter/db-schema";

// The payload of a message update the client applies to its own list: the message named by its room and integer id,
// with the fields the update changed
export interface MessageEvents {
  updateMessage: [[Partial<RoomMessage> & Pick<RoomMessage, "id"> & { roomId: string }]];
}
