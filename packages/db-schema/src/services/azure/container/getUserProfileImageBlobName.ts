import type { UserInAuth } from "#src/schema/auth/usersInAuth";

// The one blob a user's profile image is written to. The web app mints its write SAS for this name, and the function
// that deletes a landing after its account is gone matches it, so the name is built here and nowhere else
export const getUserProfileImageBlobName = (userId: UserInAuth["id"]) => `${userId}/ProfileImage`;
