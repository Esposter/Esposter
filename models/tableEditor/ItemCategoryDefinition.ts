import { IItem } from "@/models/tableEditor/IItem";

export interface ItemCategoryDefinition<T extends IItem> {
  value: T["type"];
  title: string;
  icon: string;
  targetTypeKey: Extract<keyof T, "type">;
  create: () => T;
}
