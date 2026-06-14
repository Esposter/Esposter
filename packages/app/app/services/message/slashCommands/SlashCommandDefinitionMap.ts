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
  [SlashCommandType.Remind]: {
    description: "Set a reminder",
    icon: "mdi-bell-outline",
    parameters: [],
    title: "Remind",
    type: SlashCommandType.Remind,
  },
  [SlashCommandType.Roll]: {
    description: "Roll a random number between 1 and 100",
    icon: "mdi-dice-5",
    parameters: [],
    title: "Roll",
    type: SlashCommandType.Roll,
  },
  [SlashCommandType.Schedule]: {
    description: "Schedule a message",
    icon: "mdi-send-clock",
    parameters: [],
    title: "Schedule",
    type: SlashCommandType.Schedule,
  },
  [SlashCommandType.Shrug]: {
    description: "Appends ¯\\_(ツ)_/¯ to your message",
    icon: "mdi-emoticon-confused-outline",
    parameters: [{ description: "Optional text to prepend before the shrug", isRequired: false, name: "text" }],
    title: "Shrug",
    type: SlashCommandType.Shrug,
  },
  [SlashCommandType.TableFlip]: {
    description: "Appends (╯°□°）╯︵ ┻━┻ to your message",
    icon: "mdi-emoticon-angry-outline",
    parameters: [],
    title: "TableFlip",
    type: SlashCommandType.TableFlip,
  },
  [SlashCommandType.Topic]: {
    description: "Set the room topic. Omit text to clear.",
    icon: "mdi-forum-outline",
    parameters: [{ description: "The new topic for this room", isRequired: false, name: "text" }],
    title: "Topic",
    type: SlashCommandType.Topic,
  },
  [SlashCommandType.Unflip]: {
    description: "Appends ┬─┬ノ(° -°ノ) to your message",
    icon: "mdi-emoticon-cool-outline",
    parameters: [],
    title: "Unflip",
    type: SlashCommandType.Unflip,
  },
} as const satisfies Record<SlashCommandType, SlashCommand>;
