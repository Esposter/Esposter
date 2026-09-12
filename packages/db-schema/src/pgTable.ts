import type { PgTable } from "#src/models/PgTable";
import type {
  AnyPgColumnBuilder,
  PgBuildExtraConfigColumns,
  PgSchema,
  PgTableExtraConfigValue,
} from "drizzle-orm/pg-core";

import { metadataSchema } from "#src/metadataSchema";
import { camelCase } from "drizzle-orm/pg-core";

export const pgTable: PgTable = <
  TTableName extends string,
  TColumnsMap extends Record<string, AnyPgColumnBuilder>,
  TSchema extends string,
>(
  name: TTableName,
  columns: TColumnsMap,
  {
    extraConfig,
    schema,
  }: {
    extraConfig?: (self: PgBuildExtraConfigColumns<TColumnsMap>) => PgTableExtraConfigValue[];
    schema?: PgSchema<TSchema>;
  } = {},
) => {
  const columnsWithMetadata = { ...metadataSchema, ...columns };
  return (
    schema?.table<TTableName, TColumnsMap & typeof metadataSchema>(name, columnsWithMetadata, extraConfig) ??
    camelCase.table<TTableName, TColumnsMap & typeof metadataSchema>(name, columnsWithMetadata, extraConfig)
  );
};
