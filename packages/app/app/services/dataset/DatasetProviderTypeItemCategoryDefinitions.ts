import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

const DatasetProviderTypeItemCategoryDefinitionMap = {
  [DatasetProviderType.SurveyResponses]: { title: "Survey responses" },
  [DatasetProviderType.TableDocument]: { title: "Table document" },
} as const satisfies Record<DatasetProviderType, Except<SelectItemCategoryDefinition<DatasetProviderType>, "value">>;

export const DatasetProviderTypeItemCategoryDefinitions: SelectItemCategoryDefinition<DatasetProviderType>[] =
  parseDictionaryToArray(DatasetProviderTypeItemCategoryDefinitionMap, "value");
