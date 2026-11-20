import type { usersInAuth } from "@esposter/db-schema";

// A user row for every suite that seeds one: the id doubles as the email so no second unique value is invented,
// And the clock is the epoch
export const createUser = (
  id: string,
  overrides?: Partial<typeof usersInAuth.$inferInsert>,
): typeof usersInAuth.$inferInsert => ({
  createdAt: new Date(0),
  email: id,
  emailVerified: true,
  id,
  image: "",
  name: "name",
  updatedAt: new Date(0),
  ...overrides,
});
