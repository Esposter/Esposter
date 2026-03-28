import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { BasicStringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";

export const StringTransformationItemCategoryDefinitions: SelectItemCategoryDefinition<BasicStringTransformationType>[] =
  [
    { title: "Lowercase", value: BasicStringTransformationType.Lowercase },
    { title: "Title Case", value: BasicStringTransformationType.TitleCase },
    { title: "Trim", value: BasicStringTransformationType.Trim },
    { title: "Uppercase", value: BasicStringTransformationType.Uppercase },
  ];
