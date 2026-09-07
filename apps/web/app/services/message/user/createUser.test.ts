import type { User } from "@esposter/db-schema";

import { StorageTier } from "@esposter/db-schema";
import { describe } from "vitest";

// The user row every friend, block and member test stores, removes and rolls back
export const createUser = (overrides: Partial<User> = {}): User => ({
  biography: "",
  createdAt: new Date(0),
  deletedAt: null,
  email: "",
  emailVerified: false,
  id: crypto.randomUUID(),
  image: "",
  name: "name",
  storageBytesUsed: 0,
  storageTier: StorageTier.Free,
  updatedAt: new Date(0),
  ...overrides,
});

describe.todo("createUser");
