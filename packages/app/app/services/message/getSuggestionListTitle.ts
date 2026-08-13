import type { SuggestionTrigger } from "@/services/message/SuggestionTrigger";

export const getSuggestionListTitle = (baseTitle: string, trigger: SuggestionTrigger, query: string) =>
  query ? `${baseTitle} MATCHING ${trigger}${query}` : baseTitle;
