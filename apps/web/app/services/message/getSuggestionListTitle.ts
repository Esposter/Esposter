import type { SuggestionTrigger } from "@/services/message/SuggestionTrigger";

import { SuggestionTriggerTitleMap } from "@/services/message/SuggestionTriggerTitleMap";

export const getSuggestionListTitle = (trigger: SuggestionTrigger, query: string): string => {
  const title = SuggestionTriggerTitleMap[trigger];
  return query ? `${title} MATCHING ${trigger}${query}` : title;
};
