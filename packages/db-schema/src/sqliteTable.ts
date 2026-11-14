import type { DatabaseSchema } from "#src/models/DatabaseSchema";
import type { SqliteTable } from "#src/models/SqliteTable";
import type { SQLiteColumnBuilderBase, SQLiteTableExtraConfigValue } from "drizzle-orm/sqlite-core";

import { createMetadataSchema } from "#src/createMetadataSchema";
import { camelCase } from "drizzle-orm/sqlite-core";

export const sqliteTable: SqliteTable = <
  TTableName extends string,
  TColumnsMap extends Record<string, SQLiteColumnBuilderBase>,
>(
  name: TTableName,
  columns: TColumnsMap,
  {
    extraConfig,
    schema,
  }: {
    // oxlint-disable-next-line typescript/no-explicit-any -- drizzle's extra-config callback receives the built columns
    extraConfig?: (self: any) => SQLiteTableExtraConfigValue[];
    schema?: DatabaseSchema<string>;
  } = {},
) => {
  const columnsWithMetadata = { ...createMetadataSchema(), ...columns };
  return (schema?.table ?? camelCase.table)(name, columnsWithMetadata, extraConfig);
};
