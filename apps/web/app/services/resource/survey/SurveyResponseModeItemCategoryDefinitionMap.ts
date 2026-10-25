import type { UiSelectItem } from "@/models/ui/UiSelectItem";
import type { Except } from "type-fest";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SurveyResponseMode } from "@esposter/db-schema";

export const SurveyResponseModeItemCategoryDefinitionMap = {
  [SurveyResponseMode.Anonymous]: { meaning: UiIconMeaning.Anonymous, title: SurveyResponseMode.Anonymous },
  [SurveyResponseMode.Identified]: { meaning: UiIconMeaning.Person, title: SurveyResponseMode.Identified },
} as const satisfies Record<SurveyResponseMode, Except<UiSelectItem<SurveyResponseMode>, "value">>;
