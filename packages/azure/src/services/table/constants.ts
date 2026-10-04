import { CompositeKeyPropertyNames } from "#src/models/table/CompositeKey";
import { capitalize } from "@esposter/shared";

// Azure Table spells its two key properties capitalized, where JavaScript camel-cases them
export const KEYS_TO_CAPITALIZE: ReadonlySet<string> = new Set<string>([
  CompositeKeyPropertyNames.partitionKey,
  CompositeKeyPropertyNames.rowKey,
]);
export const KEYS_TO_UNCAPITALIZE: ReadonlySet<string> = new Set<string>([
  capitalize(CompositeKeyPropertyNames.partitionKey),
  capitalize(CompositeKeyPropertyNames.rowKey),
]);
