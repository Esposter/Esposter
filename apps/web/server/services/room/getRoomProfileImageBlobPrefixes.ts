import type { RoomInMessage } from "@esposter/db-schema";

import { getRoomProfileImageBlobPrefix } from "@@/server/services/room/getRoomProfileImageBlobPrefix";

// Every prefix a room's profile-image sweep must cover, and the only names one may delete. Uploads written before
// The per-upload prefix existed sit at the flat {roomId}/ProfileImage name instead, so both are listed to reach
// Them — the flat name is never written any more, only collected.
export const getRoomProfileImageBlobPrefixes = (roomId: RoomInMessage["id"]) => [
  getRoomProfileImageBlobPrefix(roomId),
  `${roomId}/ProfileImage`,
];
