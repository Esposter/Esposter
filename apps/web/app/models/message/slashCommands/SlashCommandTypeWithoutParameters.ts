import type { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";

export type SlashCommandTypeWithoutParameters = {
  [P in SlashCommandType]: (typeof SlashCommandDefinitionMap)[P]["parameters"]["length"] extends 0 ? P : never;
}[SlashCommandType];
