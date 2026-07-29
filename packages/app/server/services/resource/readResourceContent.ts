import type { Resource } from "@esposter/db-schema";
import type { z } from "zod";

import { getContentBlobName } from "@@/server/services/resource/getContentBlobName";
import { readContentBlob } from "@@/server/services/resource/readContentBlob";

export const readResourceContent = <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  id: Resource["id"],
): Promise<undefined | z.infer<TSchema>> => readContentBlob(contentSchema, getContentBlobName(id));
