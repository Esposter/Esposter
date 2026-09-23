<script setup lang="ts">
import type { FileEdit } from "@/models/agentConsole/FileEdit";

import { DiffRowType } from "@/models/agentConsole/DiffRowType";
import { DiffRowStyleMap } from "@/services/agentConsole/DiffRowStyleMap";
import { toDiffRows } from "@/services/agentConsole/toDiffRows";

interface Props {
  fileEdit: FileEdit;
}

const { fileEdit } = defineProps<Props>();
const rows = computed(() => toDiffRows(fileEdit.oldText, fileEdit.newText));
</script>

<template>
  <div of-x-auto>
    <div v-for="(row, index) of rows" :key="index" class="row" grid cols-2>
      <div v-if="row.type === DiffRowType.Collapsed" class="muted" px-2 col-span-2>{{ row.oldLine }}</div>
      <template v-else>
        <div px-2 ws-pre :style="DiffRowStyleMap[row.type].old">{{ row.oldLine }}</div>
        <div class="new" px-2 ws-pre :style="DiffRowStyleMap[row.type].new">{{ row.newLine }}</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Rows a long diff is scrolled past are skipped by layout and paint */
.row {
  content-visibility: auto;
  contain-intrinsic-size: auto 1.25rem;
}

.muted {
  color: var(--agent-console-muted);
}

.new {
  border-left: 0.125rem solid var(--agent-console-panel-edge);
}
</style>
