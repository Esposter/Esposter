import type { DatabaseSchema } from "#src/models/DatabaseSchema";
import type { TableScope } from "#src/models/realtime/TableScope";
import type { SqliteTable, SqliteTableExtraConfig } from "#src/models/SqliteTable";
import type { ColumnBuilderBase } from "drizzle-orm";

import { createMetadataSchema } from "#src/createMetadataSchema";
import { TABLE_SCOPE_KEY } from "#src/services/realtime/constants";
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
    scope,
  }: {
    extraConfig?: SqliteTableExtraConfig<TTableName, TColumnsMap>;
    schema?: DatabaseSchema<string>;
    scope?: TableScope<Extract<keyof TColumnsMap, string>>;
  } = {},
) => {
  const columnsWithMetadata = { ...createMetadataSchema(), ...columns };
  const table = (schema?.table ?? camelCase.table)(name, columnsWithMetadata, extraConfig);
  // The scope is written beside the table, so a read of an alias of the table finds it too
  if (scope) Object.defineProperty(table, TABLE_SCOPE_KEY, { value: scope });
  return table;
};
