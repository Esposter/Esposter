import type { Resource } from "@esposter/db-schema";
import type { z } from "zod";

import { readContentBlob } from "@@/server/services/resource/readContentBlob";
import { getContentBlobName } from "@esposter/db";

export const readResourceContent = <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  id: Resource["id"],
): Promise<undefined | z.infer<TSchema>> => readContentBlob(contentSchema, getContentBlobName(id));
