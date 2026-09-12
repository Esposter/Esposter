import type { SlashCommandMenuCommand } from "@/models/message/slashCommands/SlashCommandMenuCommand";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";

export const REQUIRED_ERROR_MESSAGE = "This option is required. Specify a value.";
// The three commands that open a dialog instead of sending something. Their titles name the command (`/poll`),
// Which reads as a noun in a menu of actions, so the menu writes the verb and takes the icon from the definition —
// An entry can then never drift from the command it runs
export const MENU_SLASH_COMMANDS: SlashCommandMenuCommand[] = [
  { title: "Create Poll", type: SlashCommandType.Poll },
  { title: "Schedule Message", type: SlashCommandType.Schedule },
  { title: "Set Reminder", type: SlashCommandType.Remind },
];
