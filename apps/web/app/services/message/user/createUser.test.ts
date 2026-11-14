import type { PublicUser } from "@esposter/db-schema";

import { v7 } from "uuid";
import { describe } from "vitest";

// The user row every friend, block and member test stores, removes and rolls back
export const createUser = (overrides: Partial<PublicUser> = {}): PublicUser => ({
  biography: "",
  createdAt: new Date(0),
  deletedAt: null,
  id: v7(),
  image: "",
  name: "name",
  updatedAt: new Date(0),
  ...overrides,
});

describe.todo("createUser");
