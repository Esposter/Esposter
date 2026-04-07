import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";

export const SlashCommandDefinitionMap = {
  [SlashCommandType.Poll]: {
    description: "Create a poll for the room to vote on",
    icon: "mdi-poll",
    title: "Poll",
    type: SlashCommandType.Poll,
  },
  [SlashCommandType.Roll]: {
    description: "Roll a random number between 1 and 100",
    icon: "mdi-dice-5",
    title: "Roll",
    type: SlashCommandType.Roll,
  },
} as const satisfies Record<SlashCommandType, SlashCommand>;
