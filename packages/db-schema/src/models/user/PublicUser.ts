import type { UserInAuth } from "#src/schema/auth/usersInAuth";
import type { z } from "zod";

import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";

// What one user may see of another: never their email or their storage account, which are the account holder's
// Alone. Every row a procedure hands a client about somebody else is this, never a User. The row's timestamps ride
// Along so a list of users pages by them like any other
export type PublicUser = Pick<
  UserInAuth,
  "biography" | "createdAt" | "deletedAt" | "id" | "image" | "name" | "updatedAt"
>;

export const publicUserSchema = selectUserInAuthSchema.pick({
  biography: true,
  createdAt: true,
  deletedAt: true,
  id: true,
  image: true,
  name: true,
  updatedAt: true,
}) satisfies z.ZodType<PublicUser>;
