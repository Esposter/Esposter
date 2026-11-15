import type { SlashCommandType } from "#src/models/message/slashCommands/SlashCommandType";
import type { SlashCommandDefinitionMap } from "#src/services/message/slashCommands/SlashCommandDefinitionMap";

export type SlashCommandTypeWithoutParameters = {
  [P in SlashCommandType]: (typeof SlashCommandDefinitionMap)[P]["parameters"]["length"] extends 0 ? P : never;
}[SlashCommandType];
