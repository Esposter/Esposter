import { CORE_MIGRATIONS_FOLDER } from "#src/services/devSeed/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

type SnapshotEntity = SnapshotForeignKey | { entityType: string };
interface SnapshotForeignKey {
  entityType: "fks";
  onDelete: string;
  table: string;
  tableTo: string;
}

const getKeepStatement = (table: string) => `CREATE TABLE \`__keep_${table}\` AS SELECT * FROM \`${table}\``;
const getRestoreStatement = (table: string) => `INSERT INTO \`${table}\` SELECT * FROM \`__keep_${table}\``;
const getDropStatement = (table: string) => `DROP TABLE \`${table}\``;

// Every table with a foreign key to `parent` whose delete action is `onDelete`, then, for a cascade, the tables cascading
// From those in turn
const collectChildren = (
  foreignKeys: SnapshotForeignKey[],
  parent: string,
  onDelete: string,
  children = new Set<string>(),
): Set<string> => {
  for (const foreignKey of foreignKeys) {
    if (foreignKey.tableTo !== parent || foreignKey.onDelete !== onDelete || children.has(foreignKey.table)) continue;

    children.add(foreignKey.table);
    if (onDelete === "CASCADE") collectChildren(foreignKeys, foreignKey.table, onDelete, children);
  }

  return children;
};

// Why a rebuild on D1 empties its children, and the keep-and-restore form that guards them, is the drizzle skill's
// (`references/migrations.md`, "Schema changes rebuild tables"). The object migrations under
// `packages/db-schema/src/objects` are not read: Durable Object SQLite honours `PRAGMA foreign_keys=OFF`
describe("d1RebuildCascades", () => {
  const REBUILT_TABLE_REGEX = /CREATE TABLE `__new_(?<table>[^`]+)`/gu;
  const MIGRATION_FILE_NAME = "migration.sql";
  const SNAPSHOT_FILE_NAME = "snapshot.json";

  test("keeps each cascading child of a rebuilt table aside", () => {
    expect.hasAssertions();

    const findings = readdirSync(CORE_MIGRATIONS_FOLDER).flatMap((folder) => {
      const folderPath = join(CORE_MIGRATIONS_FOLDER, folder);
      const sql = readFileSync(join(folderPath, MIGRATION_FILE_NAME), "utf8");
      const { ddl } = parseMachineJson<{ ddl: SnapshotEntity[] }>(
        readFileSync(join(folderPath, SNAPSHOT_FILE_NAME), "utf8"),
      );
      const foreignKeys = ddl.filter((entity): entity is SnapshotForeignKey => entity.entityType === "fks");

      return Array.from(sql.matchAll(REBUILT_TABLE_REGEX), ({ groups }) => groups?.table ?? "").flatMap((rebuilt) => {
        const dropIndex = sql.indexOf(getDropStatement(rebuilt));
        const cascadeFindings = [...collectChildren(foreignKeys, rebuilt, "CASCADE")].flatMap((child) => {
          const keepIndex = sql.indexOf(getKeepStatement(child));
          const restoreIndex = sql.indexOf(getRestoreStatement(child));
          if (keepIndex === -1 || keepIndex > dropIndex)
            return [`${folder}: rebuilds ${rebuilt} without keeping ${child} first`];
          if (restoreIndex < dropIndex) return [`${folder}: rebuilds ${rebuilt} without writing ${child} back after`];
          return [];
        });
        // A set-null child keeps its rows through the drop but loses its reference, which no keep-and-insert restores
        const setNullFindings = Array.from(
          collectChildren(foreignKeys, rebuilt, "SET NULL"),
          (child) => `${folder}: rebuilds ${rebuilt}, which nulls ${child}'s reference to it`,
        );
        return [...cascadeFindings, ...setNullFindings];
      });
    });

    expect(findings).toStrictEqual([]);
  });
});
