/* oxlint-disable @typescript-eslint/no-unnecessary-type-arguments */
import type { BuildColumns, BuildExtraConfigColumns } from "drizzle-orm";
import type { PgColumnBuilderBase, PgSchema, PgTableExtraConfigValue, PgTableWithColumns, } from "drizzle-orm/pg-core";

import { metadataSchema } from "@/metadataSchema";
import { pgTable as basePgTable } from "drizzle-orm/pg-core";

export interface PgTable {
  <TTableName extends string, TColumnsMap extends Record<string, PgColumnBuilderBase>, TSchema extends string>(
    name: TTableName,
    columns: TColumnsMap,
    config?: {
      extraConfig?: (self: BuildExtraConfigColumns<TTableName, TColumnsMap, "pg">) => PgTableExtraConfigValue[];
      schema?: PgSchema<TSchema>;
    },
  ): PgTableWithColumns<{
    columns: BuildColumns<TTableName, TColumnsMap & typeof metadataSchema, "pg">;
    dialect: "pg";
    name: TTableName;
    schema: TSchema;
  }>;
  <TTableName extends string, TColumnsMap extends Record<string, PgColumnBuilderBase>>(
    name: TTableName,
    columns: TColumnsMap,
    config?: {
      extraConfig?: (self: BuildExtraConfigColumns<TTableName, TColumnsMap, "pg">) => PgTableExtraConfigValue[];
    },
  ): PgTableWithColumns<{
    columns: BuildColumns<TTableName, TColumnsMap & typeof metadataSchema, "pg">;
    dialect: "pg";
    name: TTableName;
    schema: undefined;
  }>;
}

export const pgTable: PgTable = <
  TTableName extends string,
  TColumnsMap extends Record<string, PgColumnBuilderBase>,
  TSchema extends string,
>(
  name: TTableName,
  columns: TColumnsMap,
  {
    extraConfig,
    schema,
  }: {
    extraConfig?: (self: BuildExtraConfigColumns<TTableName, TColumnsMap, "pg">) => PgTableExtraConfigValue[];
    schema?: PgSchema<TSchema>;
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
