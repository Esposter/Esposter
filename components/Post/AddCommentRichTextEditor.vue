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
    <template #append-footer>
      <StyledButton @click="description.length > 0 && createComment({ parentId: postId, description })">
        Comment
      </StyledButton>
    </template>
  </PostDescriptionRichTextEditor>
</template>
