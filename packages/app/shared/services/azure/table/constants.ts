import { CompositeKeyPropertyNames } from "#shared/models/azure/CompositeKey";
import { capitalize } from "@esposter/shared";
// Stupid Azure and Javascript property name casing conventions
export const KeysToCapitalize = new Set<string>([
  CompositeKeyPropertyNames.partitionKey,
  CompositeKeyPropertyNames.rowKey,
]);

export const KeysToUncapitalize = new Set<string>([
  capitalize(CompositeKeyPropertyNames.partitionKey),
  capitalize(CompositeKeyPropertyNames.rowKey),
]);
