import { CompositeKeyPropertyNames } from "@esposter/db-schema";

export const CompositeAzureKeyPath: [
  typeof CompositeKeyPropertyNames.partitionKey,
  typeof CompositeKeyPropertyNames.rowKey,
] = [CompositeKeyPropertyNames.partitionKey, CompositeKeyPropertyNames.rowKey];
