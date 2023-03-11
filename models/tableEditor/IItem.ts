import type { IItemType } from "@/models/tableEditor/IItemType";
import type { Item } from "@/models/tableEditor/Item";

// This is not directly used when creating new classes
// but is only used as a convenient wrapper type for helper functions
// to enforce that all entities implement IItem
export type IItem = Item & IItemType<string>;
