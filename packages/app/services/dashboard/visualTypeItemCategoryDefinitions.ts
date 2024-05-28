import { VisualType } from "@/models/dashboard/VisualType";
import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

export const VisualTypeItemCategoryDefinitions: SelectItemCategoryDefinition<VisualType>[] = [
  {
    value: VisualType.Area,
    title: VisualType.Area,
  },
  {
    value: VisualType.Column,
    title: VisualType.Column,
  },
  {
    value: VisualType.Line,
    title: VisualType.Line,
  },
];
