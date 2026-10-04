<script setup lang="ts">
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { sortCompletedTodoListItems } from "@/services/resource/todoList/sortCompletedTodoListItems";
import { sortTodoListItems } from "@/services/resource/todoList/sortTodoListItems";
import { useResourceStore } from "@/store/resource";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoListPrintDialogStore } from "@/store/resource/todoList/printDialog";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const todoListStore = useTodoListStore();
const { items, sort } = storeToRefs(todoListStore);
const todoListPrintDialogStore = useTodoListPrintDialogStore();
const { isNotesPrinted, isStepsPrinted } = storeToRefs(todoListPrintDialogStore);
// The list as the reader sees it: open todos in their sort, then the completed ones, the newest completion first
const openItems = computed(() =>
  sortTodoListItems(
    items.value.filter(({ completedAt }) => !completedAt),
    sort.value,
  ),
);
const completedItems = computed(() => sortCompletedTodoListItems(items.value.filter(({ completedAt }) => completedAt)));
const sections = computed(() => [
  { title: "", todos: openItems.value },
  { title: "Completed", todos: completedItems.value },
]);
// The rest of the page is hidden in print only while this sheet is mounted, so an ordinary print of the app
// Is untouched
useHead({ bodyAttrs: { "data-todo-list-printing": "" } });
</script>

<!-- What the page prints: the list's name, each todo with a circle to tick on paper, its due date, and its steps and
     notes when the dialog asked for them. Drawn only for print, and teleported to the body so nothing of the app's
     shell surrounds it -->
<template>
  <Teleport to="body">
    <article class="todo-list-print-sheet hidden print:block">
      <h1>{{ resource?.name }}</h1>
      <template v-for="{ title, todos } of sections" :key="title">
        <h2 v-if="title && todos.length > 0">{{ title }}</h2>
        <ul>
          <li v-for="{ completedAt, dueAt, id, name, notes, steps } of todos" :key="id">
            <p :data-completed="Boolean(completedAt)">{{ completedAt ? "●" : "○" }} {{ name }}</p>
            <p v-if="dueAt && !completedAt">Due <NuxtTime :="RESOURCE_DATE_TIME_ATTRIBUTES" :datetime="dueAt" /></p>
            <ul v-if="isStepsPrinted && steps">
              <li v-for="step of steps" :key="step.id" :data-completed="Boolean(step.completedAt)">
                {{ step.completedAt ? "●" : "○" }} {{ step.name }}
              </li>
            </ul>
            <!-- eslint-disable-next-line vue/no-v-html -- the notes are the editor's sanitized HTML -->
            <div v-if="isNotesPrinted && !EMPTY_TEXT_REGEX.test(notes)" class="rich-text-content" v-html="notes" />
          </li>
        </ul>
      </template>
    </article>
  </Teleport>
</template>

<style scoped>
/* Printed in the light scheme whatever the page's theme, since paper is white; the app beside the sheet is hidden */
@media print {
  :global(body[data-todo-list-printing] > :not(.todo-list-print-sheet)) {
    display: none !important;
  }

  .todo-list-print-sheet {
    color-scheme: light;
    color: CanvasText;
    background: Canvas;
  }

  li {
    break-inside: avoid;
  }

  [data-completed="true"] {
    text-decoration: line-through;
  }
}
</style>
