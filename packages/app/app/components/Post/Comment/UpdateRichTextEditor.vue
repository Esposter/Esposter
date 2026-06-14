<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

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
</script>

<template>
  <PostDescriptionRichTextEditor v-model="editedDescriptionHtml" height="4rem" placeholder="">
    <template #append-footer="{ editor }">
      <v-btn size="small" text="Cancel" variant="outlined" @click="emit('update:update-mode', false)" />
      <StyledButton
        v-if="editor"
        ml-2
        :button-props="{ size: 'small', text: 'Save' }"
        @click="
          async () => {
            await withFinalizerAsync(
              async () => {
                if (editedDescriptionHtml === comment.description) return;
                if (EMPTY_TEXT_REGEX.test(editor.getText())) {
                  emit('update:delete-mode', true);
                  return;
                }

                await updateComment({ description: editedDescriptionHtml, id: comment.id });
              },
              () => {
                emit('update:update-mode', false);
                editedDescriptionHtml = comment.description;
              },
            );
          }
        "
      />
    </template>
  </PostDescriptionRichTextEditor>
</template>
