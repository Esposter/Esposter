<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";

interface PostAddCommentRichTextEditorProps {
  postId: string;
}

const { postId } = defineProps<PostAddCommentRichTextEditorProps>();
const commentStore = useCommentStore();
const { createComment } = commentStore;
const description = ref("");
</script>

<template>
  <PostDescriptionRichTextEditor v-model="description" height="4rem" placeholder="Add a comment">
    <template #append-footer="{ editor }">
      <StyledButton
        v-if="editor"
        @click="
          async () => {
            if (description.length > 0) {
              const savedDescription = description;
              editor.commands.clearContent(true);
              await createComment({ parentId: postId, description: savedDescription });
            }
          }
        "
      >
        Comment
      </StyledButton>
    </template>
  </PostDescriptionRichTextEditor>
</template>
