<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RESOURCE_DATE_TIME_ATTRIBUTES, TODO_DUE_CLOCK_INTERVAL_MS } from "@/services/resource/constants";
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
// Read on the browser's clock, since the resource explorer renders on the client alone
const now = useNow({ scheduler: (callback) => useIntervalFn(callback, TODO_DUE_CLOCK_INTERVAL_MS) });
// A completed todo is never overdue, whenever it was due
const isOverdue = computed(() => !item.value?.completedAt && item.value?.dueAt && item.value.dueAt < now.value);
</script>

<!-- A todo's row: its title, struck through once it is completed, then a line holding only what is set — when it was
     Completed, or when it is due, in the error colour once that has passed — and the notes drawn in full, since they
     Are what a todo is read for -->
<template>
  <span v-if="item" flex flex-col gap-1>
    <span
      class="name"
      :class="{ 'text-muted': item.completedAt }"
      :data-completed="Boolean(item.completedAt)"
      max-w-full
      truncate
      self-start
      >{{ item.name }}</span
    >
    <span v-if="item.completedAt" text-sm text-muted flex gap-1 items-center>
      <UiIcon :meaning="UiIconMeaning.Success" />
      Completed
      <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="item.completedAt" />
    </span>
    <span v-else-if="item.dueAt" :class="{ 'text-error': isOverdue }" text-sm text-muted flex gap-1 items-center>
      <UiIcon :meaning="UiIconMeaning.Date" />
      <span sr-only>{{ isOverdue ? "Overdue" : "Due" }}</span>
      <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="item.dueAt" />
    </span>
    <!-- eslint-disable-next-line vue/no-v-html -- the notes are the editor's sanitized HTML -->
    <span v-if="hasNotes" class="notes rich-text-content" text-sm text-muted ws-normal v-html="item.notes" />
  </span>
</template>

<style scoped>
/* The strike draws across the title from its start as the todo is ticked, and is simply there on a completed row */
.name {
  position: relative;
}

.name::after {
  position: absolute;
  inset-inline: 0;
  top: 50%;
  border-top: var(--ui-border-width) solid currentcolor;
  content: "";
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--ui-motion-short);
}

.name[data-completed="true"]::after {
  transform: none;
}

/* The row is one button, so a link in the notes is drawn but not pressed here: a click opens the todo, where it is */
.notes :deep(a) {
  pointer-events: none;
}
</style>
