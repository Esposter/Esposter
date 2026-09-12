import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";

// What each suggestion popover is headed, which the trigger that opened it decides.
export const SuggestionTriggerTitleMap: Record<SuggestionTrigger, string> = {
  [SuggestionTrigger.Emoji]: "EMOJI",
  [SuggestionTrigger.Mention]: "MEMBERS",
  [SuggestionTrigger.SlashCommand]: "COMMANDS",
};
