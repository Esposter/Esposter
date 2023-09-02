import { metadataSchema } from "@/db/shared/metadataSchema";
import type { SkipFirst } from "@/utils/types";
import { pgTable as drizzlePgTable } from "drizzle-orm/pg-core";

export const pgTable: typeof drizzlePgTable = (...args) =>
  drizzlePgTable(
    args[0],
    {
      ...metadataSchema,
      ...args[1],
    },
    ...(args.slice(2) as SkipFirst<typeof args, 2>),
  );
