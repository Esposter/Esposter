import type { users } from "@esposter/db-schema";

import { describe } from "vitest";

// A member row for the mention fan-out suites: the id doubles as the email so no second unique value is invented,
// And the timestamps are the caller's so a whole fixture shares one clock
export const createUser = (id: string, createdAt: Date, name: string): typeof users.$inferInsert => ({
  createdAt,
  email: id,
  emailVerified: true,
  id,
  image: "",
  name,
  updatedAt: createdAt,
});

describe.todo("createUser");
