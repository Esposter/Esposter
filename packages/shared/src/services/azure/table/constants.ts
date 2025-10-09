import { CompositeKeyPropertyNames } from "@/models/azure/table/CompositeKey";
import { capitalize } from "@/util/text/capitalize";
// Crazy big timestamps for calculating reverse-ticked timestamps.
// It also indicates how long before azure table storage
// completely ***ks up trying to insert a negative partition / row key
export const AZURE_SELF_DESTRUCT_TIMER: string = "9".repeat(30);
export const AZURE_SELF_DESTRUCT_TIMER_SMALL: string = "9".repeat(15);
// Stupid Azure and Javascript property name casing conventions
export const KeysToCapitalize: Set<string> = new Set<string>([
  CompositeKeyPropertyNames.partitionKey,
  CompositeKeyPropertyNames.rowKey,
]);

export const KeysToUncapitalize: Set<string> = new Set<string>([
  capitalize(CompositeKeyPropertyNames.partitionKey),
  capitalize(CompositeKeyPropertyNames.rowKey),
]);
