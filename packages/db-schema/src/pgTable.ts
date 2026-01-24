import type {
  AnyPgColumnBuilder,
  PgBuildExtraConfigColumns,
  PgSchema,
  PgTableExtraConfigValue,
} from "drizzle-orm/pg-core";

import { metadataSchema } from "@/metadataSchema";
import { pgTable as basePgTable } from "drizzle-orm/pg-core";

export const pgTable = <
  TTableName extends string,
  TColumnsMap extends Record<string, AnyPgColumnBuilder>,
  TSchema extends string | undefined,
>(
  name: TTableName,
  columns: TColumnsMap,
  {
    extraConfig,
    schema,
  }: {
    extraConfig?: (self: PgBuildExtraConfigColumns<TColumnsMap>) => PgTableExtraConfigValue[];
    schema?: TSchema extends string ? PgSchema<TSchema> : undefined;
  } = {},
) =>
  schema?.table<TTableName, TColumnsMap & typeof metadataSchema>(
    name,
    {
      ...metadataSchema,
      ...columns,
    },
    extraConfig,
  ) ??
  basePgTable<TTableName, TColumnsMap & typeof metadataSchema>(
    name,
    {
      ...metadataSchema,
      ...columns,
    },
    extraConfig,
  );
