import type { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import type { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";

export type SlashCommandTypeWithoutParameters = {
  [P in SlashCommandType]: (typeof SlashCommandDefinitionMap)[P]["parameters"]["length"] extends 0 ? P : never;
}[SlashCommandType];
