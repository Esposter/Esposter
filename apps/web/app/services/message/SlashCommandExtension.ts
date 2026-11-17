import { createSuggestionExtension } from "#src/services/message/editor/createSuggestionExtension";
import { SlashCommandSuggestion } from "#src/services/message/slashCommands/SlashCommandSuggestion";

export const SlashCommandExtension = createSuggestionExtension("slashCommand").configure({
  suggestion: SlashCommandSuggestion,
});
