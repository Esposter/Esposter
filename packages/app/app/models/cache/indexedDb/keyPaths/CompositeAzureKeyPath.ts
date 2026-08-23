import { CompositeKeyPropertyNames } from "@esposter/azure";

export const CompositeAzureKeyPath: [
  typeof CompositeKeyPropertyNames.partitionKey,
  typeof CompositeKeyPropertyNames.rowKey,
] = [CompositeKeyPropertyNames.partitionKey, CompositeKeyPropertyNames.rowKey];
