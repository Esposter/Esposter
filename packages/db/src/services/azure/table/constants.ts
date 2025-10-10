import { CompositeKeyPropertyNames } from "@esposter/db-schema";
import { capitalize } from "@esposter/shared";

export const AZURE_DEFAULT_PARTITION_KEY = "Default";
// Stupid Azure and Javascript property name casing conventions
export const KeysToCapitalize = new Set<string>([
  CompositeKeyPropertyNames.partitionKey,
  CompositeKeyPropertyNames.rowKey,
]);
export const KeysToUncapitalize = new Set<string>([
  capitalize(CompositeKeyPropertyNames.partitionKey),
  capitalize(CompositeKeyPropertyNames.rowKey),
]);
