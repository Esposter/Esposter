import { CompositeKeyPropertyNames } from "@/models/azure/table/CompositeKey";
import { capitalize } from "@esposter/shared";
// Crazy big timestamps for calculating reverse-ticked timestamps.
// It also indicates how long before azure table storage
// completely ***ks up trying to insert a negative partition / row key
export const AZURE_SELF_DESTRUCT_TIMER = "9".repeat(30);
export const AZURE_SELF_DESTRUCT_TIMER_SMALL = "9".repeat(15);
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
