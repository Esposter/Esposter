import type { UiSelectItem } from "#src/models/ui/UiSelectItem";
import type { SurveyResponseMode } from "@esposter/db-schema";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { SurveyResponseModeItemCategoryDefinitionMap } from "#src/services/resource/survey/SurveyResponseModeItemCategoryDefinitionMap";

export const SurveyResponseModeItemCategoryDefinitions: UiSelectItem<SurveyResponseMode>[] = parseDictionaryToArray(
  SurveyResponseModeItemCategoryDefinitionMap,
  "value",
);
