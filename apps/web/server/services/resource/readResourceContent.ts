import type { ResourceInResource } from "@esposter/db-schema";
import type { z } from "zod";

import { readStoredResourceContent } from "#server/services/resource/readStoredResourceContent";

// Reads the working copy and parses it with the type's content schema. A retained version is not a blob but
// An object, and `readSnapshotVersionContent` is what reconstructs one
export const readResourceContent = async <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  id: ResourceInResource["id"],
): Promise<undefined | z.infer<TSchema>> => {
  const storedContent = await readStoredResourceContent(id);
  return storedContent === null ? undefined : contentSchema.parse(storedContent);
};
