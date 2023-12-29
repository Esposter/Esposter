<script setup lang="ts">
import { usePostStore } from "@/store/post";

interface PostConfirmDeleteDialogButtonProps {
  postId: string;
}

const { postId } = defineProps<PostConfirmDeleteDialogButtonProps>();
const { deletePost } = usePostStore();
</script>

<template>
  <StyledConfirmDeleteDialogButton
    :card-props="{
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
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
