import type { Resource } from "@esposter/db-schema";
import type { z } from "zod";

import { readSerializedResourceContent } from "@@/server/services/resource/readSerializedResourceContent";

// Reads the working copy and parses it with the type's content schema. A retained version is not a blob but
// An object, and `readSnapshotVersionContent` is what reconstructs one
export const readResourceContent = async <TSchema extends z.ZodType>(
  contentSchema: TSchema,
  id: Resource["id"],
): Promise<undefined | z.infer<TSchema>> => {
  const serializedContent = await readSerializedResourceContent(id);
  // oxlint-disable-next-line no-restricted-properties -- the content schema owns date coercion, so free-text ISO strings survive
  if (serializedContent) return contentSchema.parse(JSON.parse(serializedContent));
  else return undefined;
};
