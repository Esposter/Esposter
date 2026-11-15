export const SuggestionTrigger = { Emoji: ":", Mention: "@", MergeField: "{{", Slash: "/" } as const;
export type SuggestionTrigger = (typeof SuggestionTrigger)[keyof typeof SuggestionTrigger];
