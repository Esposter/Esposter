import type { createMetadataSchema } from "#src/createMetadataSchema";
import type { DatabaseSchema } from "#src/models/DatabaseSchema";
import type { BuildColumns, ColumnBuilderBase } from "drizzle-orm";
import type { SQLiteTableExtraConfigValue, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

// Without this annotation the inferred table type breaks drizzle's query calls in apps/web's server routes (TS2769)
export type SqliteTable = <TTableName extends string, TColumnsMap extends Record<string, ColumnBuilderBase>>(
  name: TTableName,
  columns: TColumnsMap,
  config?: { extraConfig?: SqliteTableExtraConfig<TTableName, TColumnsMap>; schema?: DatabaseSchema<string> },
) => SQLiteTableWithColumns<{
  columns: BuildColumns<TTableName, ReturnType<typeof createMetadataSchema> & TColumnsMap, "sqlite">;
  dialect: "sqlite";
  isAlias: false;
  name: TTableName;
  schema: undefined;
}>;

// The callback a table declares its extra constraints and indexes in, handed the built columns it may name
export type SqliteTableExtraConfig<TTableName extends string, TColumnsMap extends Record<string, ColumnBuilderBase>> = (
  self: BuildColumns<TTableName, ReturnType<typeof createMetadataSchema> & TColumnsMap, "sqlite">,
) => SQLiteTableExtraConfigValue[];
