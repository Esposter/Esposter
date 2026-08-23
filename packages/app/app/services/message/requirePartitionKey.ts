import { CompositeKeyPropertyNames } from "@esposter/azure";
import { InvalidOperationError, Operation } from "@esposter/shared";
// Room-scoped reads require a non-empty partition key (the current room id, or the user id for rooms).
export const requirePartitionKey = (partitionKey: string | undefined, name: string): string => {
  if (!partitionKey) throw new InvalidOperationError(Operation.Read, name, CompositeKeyPropertyNames.partitionKey);
  return partitionKey;
};
