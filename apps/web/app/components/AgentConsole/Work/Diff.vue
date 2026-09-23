<script setup lang="ts">
import type { FileEdit } from "@/models/agentConsole/FileEdit";

import { DiffRowStyleMap } from "@/services/agentConsole/DiffRowStyleMap";
import { toDiffRows } from "@/services/agentConsole/toDiffRows";

interface Props {
  fileEdit: FileEdit;
}

const { fileEdit } = defineProps<Props>();
const rows = computed(() => toDiffRows(fileEdit.oldText, fileEdit.newText));
</script>

<template>
  <div font-mono of-x-auto text-body-small>
    <div v-for="(row, index) of rows" :key="index" grid cols-2>
      <div px-2 ws-pre :style="DiffRowStyleMap[row.type].old">{{ row.oldLine }}</div>
      <div px-2 b-l-1 b-border ws-pre :style="DiffRowStyleMap[row.type].new">{{ row.newLine }}</div>
    </div>
  </div>
</template>
