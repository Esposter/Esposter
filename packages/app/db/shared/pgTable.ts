import type { TupleSlice } from "@esposter/shared";
import type { PgColumnBuilderBase } from "drizzle-orm/pg-core";

import { metadataSchema } from "@/db/shared/metadataSchema";
import { pgTable as drizzlePgTable } from "drizzle-orm/pg-core";

export const pgTable = <TTableName extends string, TColumnsMap extends Record<string, PgColumnBuilderBase>>(
  ...args: Parameters<typeof drizzlePgTable<TTableName, TColumnsMap>>
) =>
  drizzlePgTable<TTableName, TColumnsMap & typeof metadataSchema>(
    args[0],
    {
      ...metadataSchema,
      ...args[1],
    },
    ...(args.slice(2) as TupleSlice<
      Parameters<typeof drizzlePgTable<TTableName, TColumnsMap & typeof metadataSchema>>,
      2
    >),
  );
