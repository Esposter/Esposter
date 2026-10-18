import type { ResourceType } from "@esposter/db-schema";

import { checkIsJsonSizeWithin } from "#server/services/resource/checkIsJsonSizeWithin";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { DatabaseEntityType } from "@esposter/db-schema";
import { getResult, Operation, applyPatches } from "@esposter/shared";
import type { ApplyPatchesResult, JsonPatchOperation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// A patch to the stored content, refused as the caller's mistake rather than the server's: an operation that cannot
// Apply names its path, a patched document the type's schema rejects names each issue's path in it, and one past the
// Content cap is refused before anything walks it whole
export const applyResourceContentPatches = (
  type: ResourceType,
  storedContent: unknown,
  operations: JsonPatchOperation[],
): ApplyPatchesResult<unknown> => {
  const { document, inverses } = getResult(() => applyPatches(storedContent, operations)).match(
    (applyPatchesResult) => applyPatchesResult,
    (error) => {
      throw new TRPCError({ cause: error, code: "BAD_REQUEST", message: error.message });
    },
  );
  // A copy shares the value it copies, so copying a document into itself doubles it with each operation and a request
  // Of a few dozen expands past what any string holds. The inverses are measured too, since a remove or a replace after
  // Such copies hands that expansion back to the caller
  if (
    !checkIsJsonSizeWithin(document, MAX_RESOURCE_CONTENT_SIZE) ||
    !checkIsJsonSizeWithin(inverses, MAX_RESOURCE_CONTENT_SIZE)
  )
    throw getInvalidOperationError(
      Operation.Update,
      DatabaseEntityType.Resource,
      `the patched content or its inverse is larger than ${MAX_RESOURCE_CONTENT_SIZE} bytes`,
    );

  const parsedContent = ResourceDefinitionMap[type].contentSchema.safeParse(document);
  if (!parsedContent.success)
    throw new TRPCError({
      cause: parsedContent.error,
      code: "BAD_REQUEST",
      message: z.prettifyError(parsedContent.error),
    });
  return { document: parsedContent.data, inverses };
};
