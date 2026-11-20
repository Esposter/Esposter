import * as dbSchema from "@esposter/db-schema";
import { getTableName, is } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("OVERLAY_TOMBSTONE_TABLES", () => {
  const serverDirectory = resolve(import.meta.dirname, "..");
  // A soft delete is an update whose set assigns deletedAt a value other than null. The table is the one the nearest update
  // before the set names, and a set passed as a variable rather than written as an object literal is not read
  const SOFT_DELETE_PATTERN = /\.update\((?<table>\w+)\)(?:(?!\.update\()[\s\S])*?\.set\(\{(?<assignments>[^}]*)\}/gu;
  const DELETED_AT_ASSIGNMENT = /\bdeletedAt\b(?!\s*:\s*null\b)/u;
  const tableNameByIdentifier = new Map(
    Object.entries(dbSchema).flatMap(([identifier, value]) =>
      is(value, SQLiteTable) ? [[identifier, getTableName(value)] as const] : [],
    ),
  );

  const readSoftDeletedTableNames = (): string[] => {
    const tableNames = new Set<string>();
    const sources = readdirSync(serverDirectory, { recursive: true })
      .filter((path) => path.endsWith(".ts") && !path.endsWith(".test.ts"))
      .map((path) => readFileSync(join(serverDirectory, path), "utf8"));
    for (const source of sources)
      for (const { groups } of source.matchAll(SOFT_DELETE_PATTERN)) {
        const { assignments = "", table = "" } = groups ?? {};
        if (DELETED_AT_ASSIGNMENT.test(assignments)) tableNames.add(tableNameByIdentifier.get(table) ?? table);
      }
    return [...tableNames].toSorted();
  };

  // The recycle bin's table is soft-deleted as well, but its own purge destroys it on its own retention, so it is expected
  // beside the registry. Any other table a server statement soft-deletes has to be registered, or this fails
  test("names every table the server soft-deletes, and only those, beside the recycle bin's", () => {
    expect.hasAssertions();

    const expectedTableNames = [...dbSchema.OVERLAY_TOMBSTONE_TABLES, dbSchema.resourcesInResource]
      .map((table) => getTableName(table))
      .toSorted();

    expect(readSoftDeletedTableNames()).toStrictEqual(expectedTableNames);
  });
});
