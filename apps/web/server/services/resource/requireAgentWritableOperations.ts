import type { ResourceType } from "@esposter/db-schema";
import type { JsonPatchOperation } from "@esposter/shared";

import { checkIsAgentWritablePath } from "#server/services/mcp/checkIsAgentWritablePath";
import { getAgentJsonSchema } from "#server/services/mcp/getAgentJsonSchema";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { exhaustiveGuard, JsonPatchOperationType, Operation } from "@esposter/shared";

// The paths an operation changes or takes a value from; a test only compares, so it may read anywhere
const getCheckedPaths = (operation: JsonPatchOperation) => {
  switch (operation.op) {
    case JsonPatchOperationType.Add:
    case JsonPatchOperationType.Remove:
    case JsonPatchOperationType.Replace:
      return [operation.path];
    case JsonPatchOperationType.Copy:
    case JsonPatchOperationType.Move:
      return [operation.from, operation.path];
    case JsonPatchOperationType.Test:
      return [];
    default:
      return exhaustiveGuard(operation);
  }
};
// Refuses a patch reaching a node the type's agent JSON Schema marks read-only or undescribed (`x-opaque`), naming the
// First such path, before the content is read: the refusal is read off the schema the agent was given, so it can know
// It first. A key the schema does not name at all is allowed, since the save's zod re-parse strips it
export const requireAgentWritableOperations = (type: ResourceType, operations: JsonPatchOperation[]) => {
  const jsonSchema = getAgentJsonSchema(ResourceDefinitionMap[type].contentSchema);
  const unwritablePath = operations
    .flatMap((operation) => getCheckedPaths(operation))
    .find((path) => !checkIsAgentWritablePath(jsonSchema, path));
  if (unwritablePath !== undefined)
    throw getInvalidOperationError(Operation.Update, unwritablePath, "the path is read-only or undescribed");
};
