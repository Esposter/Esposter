import type { UserInAuth } from "@esposter/db-schema";

// The folder a character-pack keep stages its uploads under until the server has read and hashed them. The trailing
// Slash is what keeps one user's prefix from matching another's id
export const getCharacterPackStagingPrefix = (userId: UserInAuth["id"]): string => `character-packs/staging/${userId}/`;
