import { CompositeKeyPropertyNames } from "@/models/azure/table/CompositeKey";
import { capitalize } from "@/util/text/capitalize";
// Stupid Azure and Javascript property name casing conventions
export const KeysToCapitalize: Set<string> = new Set<string>([
  CompositeKeyPropertyNames.partitionKey,
  CompositeKeyPropertyNames.rowKey,
]);

export const KeysToUncapitalize: Set<string> = new Set<string>([
  capitalize(CompositeKeyPropertyNames.partitionKey),
  capitalize(CompositeKeyPropertyNames.rowKey),
]);
