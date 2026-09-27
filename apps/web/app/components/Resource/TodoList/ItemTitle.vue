<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { useTodoListStore } from "@/store/resource/todoList";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const todoListStore = useTodoListStore();
const { items } = storeToRefs(todoListStore);
const item = computed(() => items.value.find((todo) => todo.id === id));
const hasNotes = computed(() => item.value && !EMPTY_TEXT_REGEX.test(item.value.notes));
// Read as the row draws, which only the browser does, since the resource explorer renders on the client alone
const isOverdue = computed(() => item.value?.dueAt && item.value.dueAt.getTime() < Date.now());
</script>

<!-- A todo's row as Microsoft To Do draws one: its title, and under it one line holding only what is set — the due date,
     in the error colour once it has passed, and a mark while it has notes. The notes themselves stay in the dialog -->
<template>
  <span v-if="item" flex flex-col>
    <span truncate>{{ item.name }}</span>
    <span v-if="item.dueAt || hasNotes" text-sm text-muted flex gap-2 items-center>
      <span v-if="item.dueAt" :class="{ 'text-error': isOverdue }" flex gap-1 items-center>
        <UiIcon :meaning="UiIconMeaning.Date" />
        <span sr-only>{{ isOverdue ? "Overdue" : "Due" }}</span>
        <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="item.dueAt" />
      </span>
      <UiIcon v-if="hasNotes" label="Has notes" :meaning="UiIconMeaning.Note" />
    </span>
  </span>
</template>
