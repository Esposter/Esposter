import { ItemMetadataPropertyNames } from "#shared/models/shared/ItemMetadataPropertyNames";

// The markdown table a record difference is described as — the header row and its alignment row
export const RECORD_DIFFERENCE_HEADER = "key | original | updated\n:---: | :---: | :---:";
// What the ReplaceWithNA null strategy writes into every empty cell
export const NULL_STRATEGY_NA_VALUE = "N/A";
// The item metadata keys a record difference leaves out, read off the property names rather than an instance
export const ITEM_METADATA_KEY_SET = new Set<string>([
  ItemMetadataPropertyNames.createdAt,
  ItemMetadataPropertyNames.deletedAt,
  ItemMetadataPropertyNames.updatedAt,
]);
