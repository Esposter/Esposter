<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";
import type { Editor } from "@tiptap/vue-3";

import { useCommentStore } from "@/store/post/comment";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { withFinalizerAsync } from "@esposter/shared";

interface PostUpdateCommentRichTextEditorProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostUpdateCommentRichTextEditorProps>();
const emit = defineEmits<{
  "update:delete-mode": [value: true];
  "update:update-mode": [value: false];
}>();
const commentStore = useCommentStore();
const { updateComment } = commentStore;
const editedDescriptionHtml = ref(comment.description);
const resetUpdateMode = () => {
  emit("update:update-mode", false);
  editedDescriptionHtml.value = comment.description;
};
const onUpdateComment = async (editor: Editor) => {
  await withFinalizerAsync(async () => {
    if (editedDescriptionHtml.value === comment.description) return;
    if (EMPTY_TEXT_REGEX.test(editor.getText())) {
      emit("update:delete-mode", true);
      return;
    }

    await updateComment({ description: editedDescriptionHtml.value, id: comment.id });
  }, resetUpdateMode);
};
</script>

<template>
  <PostDescriptionRichTextEditor v-model="editedDescriptionHtml" height="4rem" placeholder="">
    <template #append-footer="{ editor }">
      <v-btn size="small" text="Cancel" variant="outlined" @click="emit('update:update-mode', false)" />
      <StyledButton
        v-if="editor"
        ml-2
        :button-props="{ size: 'small', text: 'Save' }"
        @click="onUpdateComment(editor)"
      />
    </template>
  </PostDescriptionRichTextEditor>
</template>
