import type { Database } from "@esposter/db-schema";

import { usersInAuth } from "@esposter/db-schema";
import { describe } from "vitest";

// A user row a suite seeds, its id doubling as its email and its name, with the epoch as its clock
export const insertUser = (db: Database, id: string) =>
  db
    .insert(usersInAuth)
    .values({
      createdAt: new Date(0),
      email: id,
      emailVerified: true,
      id,
      image: "",
      name: id,
      updatedAt: new Date(0),
    });

describe.todo("insertUser");
