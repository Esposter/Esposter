import type { createMetadataSchema } from "#src/createMetadataSchema";
import type {
  AnyPgColumnBuilder,
  PgBuildColumns,
  PgBuildExtraConfigColumns,
  PgSchema,
  PgTableExtraConfigValue,
  PgTableWithColumns,
} from "drizzle-orm/pg-core";

// Without this annotation the inferred table type breaks drizzle's query calls in apps/web's server routes (TS2769)
export interface PgTable {
  <TTableName extends string, TColumnsMap extends Record<string, AnyPgColumnBuilder>, TSchema extends string>(
    name: TTableName,
    columns: TColumnsMap,
    config?: {
      extraConfig?: (self: PgBuildExtraConfigColumns<TColumnsMap>) => PgTableExtraConfigValue[];
      schema?: PgSchema<TSchema>;
    },
  ): PgTableWithColumns<{
    columns: PgBuildColumns<TTableName, ReturnType<typeof createMetadataSchema> & TColumnsMap>;
    dialect: "pg";
    isAlias: false;
    name: TTableName;
    schema: TSchema;
  }>;
  <TTableName extends string, TColumnsMap extends Record<string, AnyPgColumnBuilder>>(
    name: TTableName,
    columns: TColumnsMap,
    config?: { extraConfig?: (self: PgBuildExtraConfigColumns<TColumnsMap>) => PgTableExtraConfigValue[] },
  ): PgTableWithColumns<{
    columns: PgBuildColumns<TTableName, ReturnType<typeof createMetadataSchema> & TColumnsMap>;
    dialect: "pg";
    isAlias: false;
    name: TTableName;
    schema: undefined;
  }>;
}
