import type { RoomInMessage } from "@esposter/db-schema";

// The folder every room profile-image upload lands under; each upload appends a unique segment so a re-upload
// Never reuses a prior blob name (see generateProfileImageUploadUrl), which is what lets the delayed cleanup on
// Image change delete only the versions the room no longer references without racing a concurrent re-upload.
export const getRoomProfileImageBlobPrefix = (roomId: RoomInMessage["id"]) => `rooms/${roomId}/ProfileImage`;
