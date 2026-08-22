<script setup lang="ts">
import type { SlashCommandTypeWithoutParameters } from "@/models/message/slashCommands/SlashCommandTypeWithoutParameters";
import type { Item } from "@/models/shared/Item";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";

// The three commands that open a dialog instead of sending something. Their titles name the command (`/poll`),
// Which reads as a noun in a menu of actions, so the menu writes the verb and takes the icon from the definition —
// An entry can then never drift from the command it runs
const MENU_COMMANDS: { title: string; type: SlashCommandTypeWithoutParameters }[] = [
  { title: "Create Poll", type: SlashCommandType.Poll },
  { title: "Schedule Message", type: SlashCommandType.Schedule },
  { title: "Set Reminder", type: SlashCommandType.Remind },
];

const executeSlashCommand = useExecuteSlashCommand();
const items = MENU_COMMANDS.map<Item>(({ title, type }) => ({
  icon: SlashCommandDefinitionMap[type].icon,
  onClick: () => executeSlashCommand({ parameterValues: {}, type }),
  title,
}));
</script>

<!-- Discord's `+`: the composer's non-text actions in one menu beside the upload button, because a poll and a
     scheduled message were otherwise reachable only by typing the slash command that opens them -->
<template>
  <StyledOverflowMenu icon="mdi-plus-circle-outline" :items text="Create" />
</template>
