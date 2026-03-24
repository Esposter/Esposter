import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";

export const ColumnTransformationTypeItemCategoryDefinitions: SelectItemCategoryDefinition<ColumnTransformationType>[] =
  Object.values(ColumnTransformationType).map((type) => ({ title: type, value: type }));
