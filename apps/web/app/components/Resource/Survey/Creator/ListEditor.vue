<script setup lang="ts" generic="TItem extends object">
import type { SurveyListEditor } from "@/models/resource/survey/SurveyListEditor";
import type { SurveyListRow } from "@/models/resource/survey/SurveyListRow";

import { capitalize } from "@esposter/shared";

interface Props {
  editor: SurveyListEditor<TItem>;
  // The list's name, drawn above its rows, such as "Choices" or "Rows"
  label: string;
  // The noun a row is named by in its group, its buttons and its removal's confirm, such as "choice" or "column"
  noun: string;
}

// A row's controls take its error and its row, and a row's own nested list, if it holds one, is drawn beneath its controls
defineSlots<{
  add: () => VNode;
  below?: (props: { index: number; row: SurveyListRow<TItem> }) => VNode;
  default: (props: { error?: string; index: number; row: SurveyListRow<TItem> }) => VNode;
}>();
const { editor } = defineProps<Props>();
const rows = computed(() => editor.rows.value);
const errors = computed(() => editor.errors.value);
const announcement = computed(() => editor.announcement.value);
// A removal is asked for first: the row it asks about is held by its id, its place is read from the rows as they are
// Now, and the confirm is open only while that row is in the list, so a change that removes it closes the confirm
const removingId = ref("");
const removingIndex = computed(() => rows.value.findIndex((row) => row.id === removingId.value));
const isRemoveOpen = computed({
  get: () => removingIndex.value !== -1,
  set: (isOpen) => {
    if (!isOpen) removingId.value = "";
  },
});
</script>

<template>
  <div flex flex-col gap-2>
    <span text-sm text-muted>{{ label }}</span>
    <div
      v-for="(row, index) of rows"
      :key="row.id"
      :aria-label="`${capitalize(noun)} ${index + 1}`"
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
          @remove="removingId = row.id"
        />
      </div>
      <slot name="below" :index :row />
    </div>
    <div aria-live="polite" sr-only>{{ announcement }}</div>
    <slot name="add" />
    <UiConfirmDialog
      v-if="isRemoveOpen"
      v-model="isRemoveOpen"
      confirm-label="Remove"
      :confirm="() => editor.removeItem(removingId)"
      :title="`Remove ${noun} ${removingIndex + 1}?`"
    >
      <p>Remove this {{ noun }} from the survey?</p>
    </UiConfirmDialog>
  </div>
</template>
