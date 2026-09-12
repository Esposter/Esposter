import type { SuggestionKeyDownProps } from "@tiptap/suggestion";

export interface SuggestionList {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}
