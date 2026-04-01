<script setup lang="ts">
import { OUTLIER_HIGHLIGHT_CLASS } from "@/services/tableEditor/file/constants";

interface FieldProps {
  findValue: string;
  isCurrentOccurrence: boolean;
  isOutlier: boolean;
  text: string;
}

const { findValue, isCurrentOccurrence, isOutlier, text } = defineProps<FieldProps>();
const emit = defineEmits<{ edit: [] }>();
</script>

<template>
  <div @dblclick.stop="emit('edit')">
    <TableEditorFileFindReplaceHighlight
      v-if="findValue"
      :class="{ [OUTLIER_HIGHLIGHT_CLASS]: isOutlier }"
      :is-current-occurrence
      :search="findValue"
      :text
    />
    <TableEditorFileRowOutlierHighlight v-else :is-outlier :text />
  </div>
</template>
