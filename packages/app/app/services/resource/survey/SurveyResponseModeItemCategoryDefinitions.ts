import type { SelectItemCategoryDefinition } from "@/models/vuetify/SelectItemCategoryDefinition";
import type { Except } from "type-fest";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { SurveyResponseMode } from "@esposter/db-schema";

const SurveyResponseModeItemCategoryDefinitionMap = {
  [SurveyResponseMode.Anonymous]: { title: SurveyResponseMode.Anonymous },
  [SurveyResponseMode.Identified]: { title: SurveyResponseMode.Identified },
} as const satisfies Record<SurveyResponseMode, Except<SelectItemCategoryDefinition<SurveyResponseMode>, "value">>;

export const SurveyResponseModeItemCategoryDefinitions: SelectItemCategoryDefinition<SurveyResponseMode>[] =
  parseDictionaryToArray(SurveyResponseModeItemCategoryDefinitionMap, "value");
