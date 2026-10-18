import type { ResourceType } from "@esposter/db-schema";

import { checkIsAgentWritablePath } from "#server/services/mcp/checkIsAgentWritablePath";
import { getAgentJsonSchema } from "#server/services/mcp/getAgentJsonSchema";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { exhaustiveGuard, Operation, JsonPatchOperationType } from "@esposter/shared";
import type { JsonPatchOperation } from "@esposter/shared";

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
// Refuses a patch reaching a node the type's agent JSON Schema marks read-only or undescribed, naming the first such
// Path, before the content is read: the refusal is read off the schema the agent was given, so it can know it first
export const requireAgentWritableOperations = (type: ResourceType, operations: JsonPatchOperation[]) => {
  const jsonSchema = getAgentJsonSchema(ResourceDefinitionMap[type].contentSchema);
  const unwritablePath = operations
    .flatMap((operation) => getCheckedPaths(operation))
    .find((path) => !checkIsAgentWritablePath(jsonSchema, path));
  if (unwritablePath !== undefined)
    throw getInvalidOperationError(Operation.Update, unwritablePath, "the path is read-only or undescribed");
};
