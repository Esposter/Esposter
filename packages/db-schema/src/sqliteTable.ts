import type { DatabaseSchema } from "#src/models/DatabaseSchema";
import type { SqliteTable, SqliteTableExtraConfig } from "#src/models/SqliteTable";
import type { ColumnBuilderBase } from "drizzle-orm";

import { createMetadataSchema } from "#src/createMetadataSchema";
import { camelCase } from "drizzle-orm/sqlite-core";

export const sqliteTable: SqliteTable = <
  TTableName extends string,
  TColumnsMap extends Record<string, ColumnBuilderBase>,
>(
  name: TTableName,
  columns: TColumnsMap,
  {
    extraConfig,
    schema,
  }: { extraConfig?: SqliteTableExtraConfig<TTableName, TColumnsMap>; schema?: DatabaseSchema<string> } = {},
) => {
  const columnsWithMetadata = { ...createMetadataSchema(), ...columns };
  return (schema?.table ?? camelCase.table)(name, columnsWithMetadata, extraConfig);
};
