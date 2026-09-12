import type { SlashCommandTypeWithoutParameters } from "@/models/message/slashCommands/SlashCommandTypeWithoutParameters";

// A slash command the composer's actions menu offers as a verb, since the command's own title names it as a noun.
export interface SlashCommandMenuCommand {
  title: string;
  type: SlashCommandTypeWithoutParameters;
}
