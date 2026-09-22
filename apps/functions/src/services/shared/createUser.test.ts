import type { users } from "@esposter/db-schema";

import { describe } from "vitest";

// A user row for every suite that seeds one: the id doubles as the email so no second unique value is invented,
// And the clock is the epoch
export const createUser = (id: string, overrides?: Partial<typeof users.$inferInsert>): typeof users.$inferInsert => ({
  createdAt: new Date(0),
  email: id,
  emailVerified: true,
  id,
  image: "",
  name: "name",
  updatedAt: new Date(0),
  ...overrides,
});

describe.todo("createUser");
