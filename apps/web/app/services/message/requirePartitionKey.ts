import { InvalidOperationError, Operation } from "@esposter/shared";
import { CompositeKeyPropertyNames } from "@esposter/db-schema";

// Room-scoped reads require a non-empty partition key (the current room id, or the user id for rooms).
export const requirePartitionKey = (partitionKey: string | undefined, name: string) => {
  if (!partitionKey) throw new InvalidOperationError(Operation.Read, name, CompositeKeyPropertyNames.partitionKey);
  return partitionKey;
};
