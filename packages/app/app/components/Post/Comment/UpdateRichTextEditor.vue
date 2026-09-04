<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { useCommentStore } from "@/store/post/comment";

interface Props {
  comment: PostWithRelations;
}

const { comment } = defineProps<Props>();
const emit = defineEmits<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>();
const commentStore = useCommentStore();
const { updateComment } = commentStore;
const editedDescriptionHtml = ref(comment.description);
const saveComment = useSaveRichTextEdit(
  editedDescriptionHtml,
  () => comment.description,
  () => updateComment({ description: editedDescriptionHtml.value, id: comment.id }, comment.parentId ?? ""),
  emit,
);
</script>

<template>
  <PostDescriptionRichTextEditor v-model="editedDescriptionHtml" height="4rem" placeholder="">
    <template #append-footer="{ editor }">
      <v-btn size="small" text="Cancel" variant="outlined" @click="emit('update:update-mode', false)" />
      <StyledButton v-if="editor" ml-2 :button-props="{ size: 'small', text: 'Save' }" @click="saveComment(editor)" />
    </template>
  </PostDescriptionRichTextEditor>
</template>
