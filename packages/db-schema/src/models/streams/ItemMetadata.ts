import type { ItemMetadata } from "@esposter/shared";

import { z } from "zod";

export const itemMetadataSchema: z.ZodObject<{
  createdAt: z.ZodDate;
  deletedAt: z.ZodNullable<z.ZodDate>;
  updatedAt: z.ZodDate;
}> = z.object({
  createdAt: z.date(),
  // eslint-disable-next-line no-restricted-syntax -- the soft-delete column Drizzle and Azure Table rows share
  deletedAt: z.date().nullable(),
  updatedAt: z.date(),
}) satisfies z.ZodType<ItemMetadata>;
