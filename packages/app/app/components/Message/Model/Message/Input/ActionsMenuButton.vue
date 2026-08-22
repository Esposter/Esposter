<script setup lang="ts">
import type { SlashCommandTypeWithoutParameters } from "@/models/message/slashCommands/SlashCommandTypeWithoutParameters";
import type { Item } from "@/models/shared/Item";

import { SlashCommandType } from "@/models/message/slashCommands/SlashCommandType";
import { pickFiles } from "@/services/file/pickFiles";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";

// The three commands that open a dialog instead of sending something. Their titles name the command (`/poll`),
// Which reads as a noun in a menu of actions, so the menu writes the verb and takes the icon from the definition —
// An entry can then never drift from the command it runs
const MENU_COMMANDS: { title: string; type: SlashCommandTypeWithoutParameters }[] = [
  { title: "Create Poll", type: SlashCommandType.Poll },
  { title: "Schedule Message", type: SlashCommandType.Schedule },
  { title: "Set Reminder", type: SlashCommandType.Remind },
];

const emit = defineEmits<{ "upload-file": [files: File[]] }>();
const executeSlashCommand = useExecuteSlashCommand();
const items = computed<Item[]>(() => [
  {
    icon: "mdi-file-upload-outline",
    onClick: async () => {
      const files = await pickFiles();
      if (files.length > 0) emit("upload-file", files);
    },
    title: "Upload a File",
  },
  ...MENU_COMMANDS.map<Item>(({ title, type }) => ({
    icon: SlashCommandDefinitionMap[type].icon,
    onClick: () => executeSlashCommand({ parameterValues: {}, type }),
    title,
  })),
]);
</script>

<!-- Discord's `+`: one menu for everything the composer does besides typing, upload included — a poll and a
     scheduled message were otherwise reachable only by typing the command that opens them, and a second plus
     button beside this one would be two buttons for one idea -->
<template>
  <StyledOverflowMenu icon="mdi-plus" :items text="Add" />
</template>
