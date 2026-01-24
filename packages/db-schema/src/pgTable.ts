import type {
  AnyPgColumnBuilder,
  PgBuildColumns,
  PgBuildExtraConfigColumns,
  PgSchema,
  PgTableExtraConfigValue,
  PgTableWithColumns,
} from "drizzle-orm/pg-core";

import { metadataSchema } from "@/metadataSchema";
import { pgTable as basePgTable } from "drizzle-orm/pg-core";

export interface PgTable {
  <TTableName extends string, TColumnsMap extends Record<string, AnyPgColumnBuilder>, TSchema extends string>(
    name: TTableName,
    columns: TColumnsMap,
    config?: {
      extraConfig?: (self: PgBuildExtraConfigColumns<TColumnsMap>) => PgTableExtraConfigValue[];
      schema?: PgSchema<TSchema>;
    },
  ): PgTableWithColumns<{
    columns: PgBuildColumns<TTableName, TColumnsMap & typeof metadataSchema>;
    dialect: "pg";
    name: TTableName;
    schema: TSchema;
  }>;
  <TTableName extends string, TColumnsMap extends Record<string, AnyPgColumnBuilder>>(
    name: TTableName,
    columns: TColumnsMap,
    config?: {
      extraConfig?: (self: PgBuildExtraConfigColumns<TColumnsMap>) => PgTableExtraConfigValue[];
    },
  ): PgTableWithColumns<{
    columns: PgBuildColumns<TTableName, TColumnsMap & typeof metadataSchema>;
    dialect: "pg";
    name: TTableName;
    schema: undefined;
  }>;
}

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
