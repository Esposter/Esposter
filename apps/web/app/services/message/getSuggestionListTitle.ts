import type { SuggestionTrigger } from "@/services/message/SuggestionTrigger";

// Each popover passes its own title, since two popovers can share a trigger character
export const getSuggestionListTitle = (title: string, trigger: SuggestionTrigger, query: string) =>
  query ? `${title} MATCHING ${trigger}${query}` : title;
