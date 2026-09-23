<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
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
      <UiButton py-1 @click="emit('update:update-mode', false)">Cancel</UiButton>
      <UiButton v-if="editor" :variant="UiButtonVariant.Accent" py-1 @click="saveComment(editor)">Save</UiButton>
    </template>
  </PostDescriptionRichTextEditor>
</template>
