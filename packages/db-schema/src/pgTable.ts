import type { PgTable } from "#src/models/PgTable";
import type {
  AnyPgColumnBuilder,
  PgBuildExtraConfigColumns,
  PgSchema,
  PgTableExtraConfigValue,
} from "drizzle-orm/pg-core";

import { createMetadataSchema } from "#src/createMetadataSchema";
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
  const columnsWithMetadata = { ...createMetadataSchema(), ...columns };
  return (
    schema?.table<TTableName, ReturnType<typeof createMetadataSchema> & TColumnsMap>(
      name,
      columnsWithMetadata,
      extraConfig,
    ) ??
    camelCase.table<TTableName, ReturnType<typeof createMetadataSchema> & TColumnsMap>(
      name,
      columnsWithMetadata,
      extraConfig,
    )
  );
};
