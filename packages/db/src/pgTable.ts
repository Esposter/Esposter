import type { BuildColumns, BuildExtraConfigColumns } from "drizzle-orm";
import type { PgColumnBuilderBase, PgSchema, PgTableExtraConfigValue, PgTableWithColumns } from "drizzle-orm/pg-core";

import { metadataSchema } from "@/metadataSchema";
import { pgTable as basePgTable } from "drizzle-orm/pg-core";

export const pgTable = <
  TTableName extends string,
  TColumnsMap extends Record<string, PgColumnBuilderBase>,
  TSchema extends string | undefined,
>(
  name: TTableName,
  columns: TColumnsMap,
  {
    extraConfig,
    schema,
  }: {
    extraConfig?: (self: BuildExtraConfigColumns<TTableName, TColumnsMap, "pg">) => PgTableExtraConfigValue[];
    schema?: TSchema extends string ? PgSchema<TSchema> : undefined;
  },
) =>
  (schema?.table<TTableName, TColumnsMap & typeof metadataSchema>(
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
    )) as PgTableWithColumns<{
    columns: BuildColumns<TTableName, TColumnsMap & typeof metadataSchema, "pg">;
    dialect: "pg";
    name: TTableName;
    schema: TSchema;
  }>;
