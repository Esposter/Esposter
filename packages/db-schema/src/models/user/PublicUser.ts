import type { User } from "#src/schema/users";

// What one user may see of another: never their email or their storage account, which are the account holder's
// Alone. Every row a procedure hands a client about somebody else is this, never a User. The row's timestamps ride
// Along so a list of users pages by them like any other
export type PublicUser = Pick<User, "biography" | "createdAt" | "deletedAt" | "id" | "image" | "name" | "updatedAt">;
