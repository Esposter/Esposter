<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { pickFiles } from "@/services/file/pickFiles";
import { MENU_SLASH_COMMANDS } from "@/services/message/slashCommands/constants";
import { SlashCommandDefinitionMap } from "@/services/message/slashCommands/SlashCommandDefinitionMap";

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
  ...MENU_SLASH_COMMANDS.map<Item>(({ title, type }) => ({
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
