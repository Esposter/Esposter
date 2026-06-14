import type { RoomInMessage } from "@esposter/db-schema";

export const getRoomProfileImageBlobName = (roomId: RoomInMessage["id"]) => `${roomId}/ProfileImage`;
