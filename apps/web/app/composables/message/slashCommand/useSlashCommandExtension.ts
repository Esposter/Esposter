import { createSuggestionExtension } from "@/services/message/editor/createSuggestionExtension";
import { SlashCommandSuggestion } from "@/services/message/slashCommands/SlashCommandSuggestion";

const SlashCommandExtension = createSuggestionExtension("slashCommand");

export const useSlashCommandExtension = () => SlashCommandExtension.configure({ suggestion: SlashCommandSuggestion });
