import type { User } from "@esposter/db-schema";

import { StorageTier } from "@esposter/db-schema";
import { describe } from "vitest";

// The user row every friend, block and member test stores, removes and rolls back. Shared so adding a column to
// The user shape is one edit rather than one per test file — the fields a test actually asserts on are the ones
// It overrides.
// Spelled out in full rather than asserted, so a new required field fails to compile here instead of reaching a
// Store test as a missing column.
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
