import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { Except } from "type-fest";

import { DatasetProviderType } from "#shared/models/dataset/DatasetProviderType";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { DatasetProviderTypeIconMeaningMap } from "@/services/dataset/DatasetProviderTypeIconMeaningMap";

const DatasetProviderTypeItemCategoryDefinitionMap = {
  [DatasetProviderType.ProgramStatus]: {
    meaning: DatasetProviderTypeIconMeaningMap[DatasetProviderType.ProgramStatus],
    title: "Program status",
  },
  [DatasetProviderType.Sheet]: {
    meaning: DatasetProviderTypeIconMeaningMap[DatasetProviderType.Sheet],
    title: "Sheet",
  },
  [DatasetProviderType.SurveyResponses]: {
    meaning: DatasetProviderTypeIconMeaningMap[DatasetProviderType.SurveyResponses],
    title: "Survey responses",
  },
} as const satisfies Record<DatasetProviderType, Except<UiSelectItem<DatasetProviderType>, "value">>;

export const DatasetProviderTypeItemCategoryDefinitions: UiSelectItem<DatasetProviderType>[] = parseDictionaryToArray(
  DatasetProviderTypeItemCategoryDefinitionMap,
  "value",
);
