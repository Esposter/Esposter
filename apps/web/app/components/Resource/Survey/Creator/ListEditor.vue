<script setup lang="ts" generic="TItem extends object">
import type { SurveyListEditor } from "@/models/resource/survey/SurveyListEditor";
import type { SurveyListRow } from "@/models/resource/survey/SurveyListRow";

interface Props {
  editor: SurveyListEditor<TItem>;
  // The list's name, drawn above its rows and named by each row's group, such as "Choices" or "Rows"
  label: string;
  // The noun a row is named by in its buttons and in its removal's confirm, such as "choice" or "column"
  noun: string;
}

// A row's controls take its error and its row, and a row's own nested list, if it holds one, is drawn beneath its controls
defineSlots<{
  add: () => VNode;
  below?: (props: { index: number; row: SurveyListRow<TItem> }) => VNode;
  default: (props: { error?: string; index: number; row: SurveyListRow<TItem> }) => VNode;
}>();
const { editor, label, noun } = defineProps<Props>();
const rows = computed(() => editor.rows.value);
const errors = computed(() => editor.errors.value);
const announcement = computed(() => editor.announcement.value);
// A removal is asked for first: the row it asks about is held with its place until its confirm answers
const removingRow = ref<{ id: string; index: number }>();
const isRemoveOpen = ref(false);
const askRemove = (id: string, index: number) => {
  removingRow.value = { id, index };
  isRemoveOpen.value = true;
};
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
          :noun
          @move="(toIndex) => editor.moveItem(row.id, toIndex)"
          @remove="askRemove(row.id, index)"
        />
      </div>
      <slot name="below" :index :row />
    </div>
    <div aria-live="polite" sr-only>{{ announcement }}</div>
    <slot name="add" />
    <UiConfirmDialog
      v-if="removingRow !== undefined"
      v-model="isRemoveOpen"
      confirm-label="Remove"
      :confirm="
        () => {
          if (removingRow !== undefined) editor.removeItem(removingRow.id);
        }
      "
      :title="`Remove ${noun} ${removingRow.index + 1}?`"
    >
      <p>Remove this {{ noun }} from the survey?</p>
    </UiConfirmDialog>
  </div>
</template>
