import type { UserInAuth } from "#src/schema/auth/usersInAuth";

// The one blob a person's game save is written to.
// Each game keeps its save under this name in its own container, and the data export reads it from each of them.
export const getSaveBlobName = (userId: UserInAuth["id"]) => `${userId}/save.json`;
