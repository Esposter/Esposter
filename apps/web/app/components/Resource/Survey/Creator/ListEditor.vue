<script setup lang="ts" generic="TItem extends object">
import type { SurveyListEditor } from "@/models/resource/survey/SurveyListEditor";
import type { SurveyListRow } from "@/models/resource/survey/SurveyListRow";

interface Props {
  editor: SurveyListEditor<TItem>;
  // The list's name, drawn above its rows and named by each row's group, such as "Choices" or "Rows"
  label: string;
}

// A row's controls take its error and its row, and a row's own nested list, if it holds one, is drawn beneath its controls
defineSlots<{
  add: () => VNode;
  below?: (props: { index: number; row: SurveyListRow<TItem> }) => VNode;
  default: (props: { error?: string; index: number; row: SurveyListRow<TItem> }) => VNode;
}>();
const { editor, label } = defineProps<Props>();
const rows = computed(() => editor.rows.value);
const errors = computed(() => editor.errors.value);
const announcement = computed(() => editor.announcement.value);
</script>

<template>
  <div flex flex-col gap-2>
    <span text-sm text-muted>{{ label }}</span>
    <div
      v-for="(row, index) of rows"
      :key="row.id"
      :aria-label="`${label} ${index + 1}`"
      role="group"
      flex
      flex-col
      gap-2
      @keydown="(event) => editor.onRowKeydown(event, row.id)"
    >
      <div flex gap-2 items-start>
        <slot :error="errors[index]" :index :row />
        <ResourceSurveyCreatorRowActions
          :index
          :count="rows.length"
          @move="(toIndex) => editor.moveItem(row.id, toIndex)"
          @remove="editor.removeItem(row.id)"
        />
      </div>
      <slot name="below" :index :row />
    </div>
    <div aria-live="polite" sr-only>{{ announcement }}</div>
    <slot name="add" />
  </div>
</template>
