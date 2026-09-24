import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { Except } from "type-fest";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SurveyResponseMode } from "@esposter/db-schema";

const SurveyResponseModeItemCategoryDefinitionMap = {
  [SurveyResponseMode.Anonymous]: { meaning: UiIconMeaning.Anonymous, title: SurveyResponseMode.Anonymous },
  [SurveyResponseMode.Identified]: { meaning: UiIconMeaning.Person, title: SurveyResponseMode.Identified },
} as const satisfies Record<SurveyResponseMode, Except<UiSelectItem<SurveyResponseMode>, "value">>;

export const SurveyResponseModeItemCategoryDefinitions: UiSelectItem<SurveyResponseMode>[] = parseDictionaryToArray(
  SurveyResponseModeItemCategoryDefinitionMap,
  "value",
);
