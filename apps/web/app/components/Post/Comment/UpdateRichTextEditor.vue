<script setup lang="ts">
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useCommentStore } from "#src/store/post/comment/index";

interface Props {
  comment: PostInPostWithRelations;
}

const { comment } = defineProps<Props>();
const emit = defineEmits<{ "update:delete-mode": [value: true]; "update:update-mode": [value: false] }>();
const commentStore = useCommentStore();
const { updateComment } = commentStore;
const editedDescriptionHtml = ref(comment.description);
const { isSaving, save: saveComment } = useSaveRichTextEdit(
  editedDescriptionHtml,
  () => comment.description,
  () => updateComment({ description: editedDescriptionHtml.value, id: comment.id }),
  emit,
);
</script>

<template>
  <PostDescriptionEditor v-model="editedDescriptionHtml" height="4rem" placeholder="">
    <template #append-footer="{ editor }">
      <UiButton :disabled="isSaving" @click="emit('update:update-mode', false)">Cancel</UiButton>
      <UiButton v-if="editor" :variant="UiButtonVariant.Accent" :is-pending="isSaving" @click="saveComment(editor)">
        Save
      </UiButton>
    </template>
  </PostDescriptionEditor>
</template>
