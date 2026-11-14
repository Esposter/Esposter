import type { CoreColumn } from "#src/models/cutover/CoreColumn";
import type { CoreTable } from "#src/models/cutover/CoreTable";

import { schema } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { Column, is } from "drizzle-orm";
import { getTableConfig, SQLiteTable } from "drizzle-orm/sqlite-core";

const toCoreColumn = ({ dataType, name, notNull }: CoreColumn): CoreColumn => ({ dataType, name, notNull });

// Every table of the D1 schema, read from the generated registry. Its SQLite name is `<schema>_<table>`, and the Postgres
// table it is copied from is `"<schema>"."<table>"`, so the split happens here, once
export const getCoreTables = (): CoreTable[] =>
  Object.values(schema)
    .filter((value): value is SQLiteTable => is(value, SQLiteTable))
    .map((table) => {
      const tableConfiguration = getTableConfig(table);
      const { name } = tableConfiguration;
      const separatorIndex = name.indexOf("_");
      if (separatorIndex <= 0)
        throw new InvalidOperationError(Operation.Read, name, "has no schema prefix to copy from");
      const primaryKeyColumns = (
        tableConfiguration.primaryKeys[0]?.columns ?? tableConfiguration.columns.filter(({ primary }) => primary)
      ).map(toCoreColumn);
      if (primaryKeyColumns.length === 0)
        throw new InvalidOperationError(Operation.Read, name, "has no primary key to order its rows by");
      // Postgres keeps microseconds and D1 milliseconds, so a unique key over a timestamp is the one that can collide
      const timestampUniqueColumnGroups = [
        ...tableConfiguration.uniqueConstraints.map(({ columns }) => columns),
        ...tableConfiguration.indexes
          .filter(
            ({ config: indexConfiguration }) => indexConfiguration.unique && indexConfiguration.where === undefined,
          )
          .map(({ config: indexConfiguration }) => indexConfiguration.columns),
      ]
        .map((group) => group.flatMap((column) => (is(column, Column) ? [toCoreColumn(column)] : [])))
        .filter((group) => group.some(({ dataType }) => dataType === "object date"));
      return {
        columns: tableConfiguration.columns.map(toCoreColumn),
        foreignTableNames: tableConfiguration.foreignKeys.map(
          (foreignKey) => getTableConfig(foreignKey.reference().foreignTable).name,
        ),
        name,
        pgSchema: name.slice(0, separatorIndex),
        pgTable: name.slice(separatorIndex + 1),
        primaryKeyColumns,
        timestampUniqueColumnGroups,
      };
    });
