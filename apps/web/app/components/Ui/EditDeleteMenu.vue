<script setup lang="ts">
import { getEditDeleteItems } from "#src/services/ui/getEditDeleteItems";

interface Props {
  // What the Delete action is drawn with, such as "Delete" for a post
  deleteLabel: string;
  // What the Edit action is drawn with, such as "Edit" for a post
  editLabel: string;
  // What the actions are of, such as "Post actions": the menu's name and its trigger's
  label: string;
}
// The Edit and Delete of one thing behind one quiet mark. Its items come from the same builder a context menu over that
// Thing reads, so the overflow button and the context menu never disagree
const { deleteLabel, editLabel, label } = defineProps<Props>();
const emit = defineEmits<{ delete: []; edit: [] }>();
const items = computed(() =>
  getEditDeleteItems({
    deleteLabel,
    editLabel,
    onDelete: () => {
      emit("delete");
    },
    onEdit: () => {
      emit("edit");
    },
  }),
);
</script>

<template>
  <UiOverflowMenu :items :label />
</template>
