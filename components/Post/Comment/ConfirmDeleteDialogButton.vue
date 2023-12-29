<script setup lang="ts">
import { useCommentStore } from "@/store/post/comment";

interface PostCommentConfirmDeleteDialogButtonProps {
  commentId: string;
}

const { commentId } = defineProps<PostCommentConfirmDeleteDialogButtonProps>();
const { deleteComment } = useCommentStore();
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: 'Delete Comment',
      text: 'Are you sure you want to delete this comment?',
    }"
    @delete="
      async (onComplete) => {
        try {
          await deleteComment(commentId);
        } finally {
          onComplete();
        }
      }
    "
  />
</template>
