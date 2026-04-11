import type { SlashCommand } from "@/models/message/slashCommands/SlashCommand";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";

export const SlashCommandDefinitionMap = {
  [SlashCommandType.Flip]: {
    description: "Flip a coin",
    icon: "mdi-currency-usd",
    parameters: [],
    title: "Flip",
    type: SlashCommandType.Flip,
  },
  [SlashCommandType.Me]: {
    description: "Displays text with emphasis",
    icon: "mdi-slash-forward",
    parameters: [{ description: "The action or text to display with emphasis", isRequired: true, name: "message" }],
    title: "Me",
    type: SlashCommandType.Me,
  },
  [SlashCommandType.Poll]: {
    description: "Create a poll for the room to vote on",
    icon: "mdi-poll",
    parameters: [],
    title: "Poll",
    type: SlashCommandType.Poll,
  },
  [SlashCommandType.Roll]: {
    description: "Roll a random number between 1 and 100",
    icon: "mdi-dice-5",
    parameters: [],
    title: "Roll",
    type: SlashCommandType.Roll,
  },
  [SlashCommandType.Shrug]: {
    description: "Appends ¯\\_(ツ)_/¯ to your message",
    icon: "mdi-emoticon-confused-outline",
    parameters: [{ description: "Optional text to prepend before the shrug", isRequired: false, name: "text" }],
    title: "Shrug",
    type: SlashCommandType.Shrug,
  },
  [SlashCommandType.TableFlip]: {
    description: "Flips a table",
    icon: "mdi-table-off",
    parameters: [],
    title: "TableFlip",
    type: SlashCommandType.TableFlip,
  },
  [SlashCommandType.Unflip]: {
    description: "Unflips a table",
    icon: "mdi-table",
    parameters: [],
    title: "Unflip",
    type: SlashCommandType.Unflip,
  },
} as const satisfies Record<SlashCommandType, SlashCommand>;
