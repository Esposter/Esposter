<script setup lang="ts">
import { usePostStore } from "@/store/post";

interface PostConfirmDeleteDialogButtonProps {
  postId: string;
  isComment?: true;
}

const { postId, isComment } = defineProps<PostConfirmDeleteDialogButtonProps>();
const { deletePost } = usePostStore();
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: `Delete ${isComment ? 'Comment' : 'Post'}`,
      text: `Are you sure you want to delete this ${isComment ? 'comment' : 'post'}?`,
    }"
    @delete="
      async (onComplete) => {
        try {
          await deletePost(postId);
        } finally {
          onComplete();
        }
      }
    "
  />
</template>
