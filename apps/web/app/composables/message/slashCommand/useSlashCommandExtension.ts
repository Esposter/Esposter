import { createSuggestionExtension } from "#src/services/message/editor/createSuggestionExtension";
import { SlashCommandSuggestion } from "#src/services/message/slashCommands/SlashCommandSuggestion";

const SlashCommandExtension = createSuggestionExtension("slashCommand");

export const useSlashCommandExtension = () => SlashCommandExtension.configure({ suggestion: SlashCommandSuggestion });
