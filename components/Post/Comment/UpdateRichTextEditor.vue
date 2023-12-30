<script setup lang="ts">
import { type PostWithRelations } from "@/db/schema/posts";
import { useCommentStore } from "@/store/post/comment";
import { EMPTY_TEXT_REGEX } from "@/util/text";
import { type Editor } from "@tiptap/vue-3";

interface PostUpdateCommentRichTextEditorProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostUpdateCommentRichTextEditorProps>();
const emit = defineEmits<{
  "update:update-mode": [value: false];
  "update:delete-mode": [value: true];
}>();
const commentStore = useCommentStore();
const { updateComment } = commentStore;
// @TODO: It seems like putting the destructured prop inside a ref causes a deepEqual
// maximum call stack size exceeded error, might be some weird magic that's erroring out
const description = comment.description;
const editedDescriptionHtml = ref(description);
const onUpdateComment = async (editor: Editor) => {
  try {
    if (editedDescriptionHtml.value === comment.description) return;
    if (EMPTY_TEXT_REGEX.test(editor.getText())) {
      emit("update:delete-mode", true);
      return;
    }

    await updateComment({ id: comment.id, description: editedDescriptionHtml.value });
  } finally {
    emit("update:update-mode", false);
    editedDescriptionHtml.value = comment.description;
  }
};
</script>

<template>
  <PostDescriptionRichTextEditor v-model="editedDescriptionHtml" height="4rem" placeholder="Add a comment">
    <template #append-footer="{ editor }">
      <v-btn variant="outlined" size="small" @click="emit('update:update-mode', false)">Cancel</v-btn>
      <StyledButton v-if="editor" ml-2 size="small" @click="onUpdateComment(editor)">Save</StyledButton>
    </template>
  </PostDescriptionRichTextEditor>
</template>
