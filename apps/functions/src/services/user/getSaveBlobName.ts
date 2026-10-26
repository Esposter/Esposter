import type { UserInAuth } from "@esposter/db-schema";

export const getSaveBlobName = (userId: UserInAuth["id"]) => `${userId}/save.json`;
