<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { Editor } from "@tiptap/vue-3";

interface Props {
  editor?: Editor;
}

const { editor } = defineProps<Props>();
const isTableActive = ref(editor?.isActive("table") ?? false);
const items = computed<Item[]>(() => [
  {
    icon: "i-mdi:table-row-plus-before",
    onClick: () => {
      editor?.chain().focus().addRowBefore().run();
    },
    title: "Add row above",
  },
  {
    icon: "i-mdi:table-row-plus-after",
    onClick: () => {
      editor?.chain().focus().addRowAfter().run();
    },
    title: "Add row below",
  },
  {
    icon: "i-mdi:table-column-plus-before",
    onClick: () => {
      editor?.chain().focus().addColumnBefore().run();
    },
    title: "Add column left",
  },
  {
    icon: "i-mdi:table-column-plus-after",
    onClick: () => {
      editor?.chain().focus().addColumnAfter().run();
    },
    title: "Add column right",
  },
  {
    icon: "i-mdi:table-row-remove",
    isDanger: true,
    onClick: () => {
      // eslint-disable-next-line no-restricted-syntax -- removes a row from the unsaved note editor draft
      editor?.chain().focus().deleteRow().run();
    },
    title: "Delete row",
  },
  {
    icon: "i-mdi:table-column-remove",
    isDanger: true,
    onClick: () => {
      // eslint-disable-next-line no-restricted-syntax -- removes a column from the unsaved note editor draft
      editor?.chain().focus().deleteColumn().run();
    },
    title: "Delete column",
  },
  {
    icon: "i-mdi:table-headers-eye",
    onClick: () => {
      editor?.chain().focus().toggleHeaderRow().run();
    },
    title: "Toggle header row",
  },
  {
    icon: "i-mdi:table-headers-eye-off",
    onClick: () => {
      editor?.chain().focus().toggleHeaderColumn().run();
    },
    title: "Toggle header column",
  },
  {
    icon: "i-mdi:table-remove",
    isDanger: true,
    onClick: () => {
      // eslint-disable-next-line no-restricted-syntax -- removes a table from the unsaved note editor draft
      editor?.chain().focus().deleteTable().run();
    },
    title: "Delete table",
  },
]);

watchImmediate(
  () => editor,
  (currentEditor, _previousEditor, onCleanup) => {
    if (!currentEditor) {
      isTableActive.value = false;
      return;
    }
    const update = () => {
      isTableActive.value = currentEditor.isActive("table");
    };
    currentEditor.on("selectionUpdate", update);
    update();
    onCleanup(() => currentEditor.off("selectionUpdate", update));
  },
);
</script>

<template>
  <UiOverflowMenu v-if="isTableActive" :items label="Table actions" />
</template>
