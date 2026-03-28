import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/StringTransformationType";

export const StringTransformationItemCategoryDefinitions: SelectItemCategoryDefinition<StringTransformationType>[] = [
  { title: "Lowercase", value: StringTransformationType.Lowercase },
  { title: "Title Case", value: StringTransformationType.TitleCase },
  { title: "Trim", value: StringTransformationType.Trim },
  { title: "Uppercase", value: StringTransformationType.Uppercase },
];
