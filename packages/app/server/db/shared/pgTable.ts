import type { BuildExtraConfigColumns } from "drizzle-orm";
import type { PgColumnBuilderBase, PgTableExtraConfigValue } from "drizzle-orm/pg-core";

import { metadataSchema } from "@/server/db/shared/metadataSchema";
import { pgTable as basePgTable } from "drizzle-orm/pg-core";

export const pgTable = <TTableName extends string, TColumnsMap extends Record<string, PgColumnBuilderBase>>(
  name: TTableName,
  columns: TColumnsMap,
  extraConfig?: (self: BuildExtraConfigColumns<TTableName, TColumnsMap, "pg">) => PgTableExtraConfigValue[],
) =>
  basePgTable<TTableName, TColumnsMap & typeof metadataSchema>(
    name,
    {
      ...columns,
      ...metadataSchema,
    },
    extraConfig,
  );
