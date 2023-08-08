<script setup lang="ts">
import { usePostStore } from "@/store/post";

interface PostConfirmDeleteDialogButtonProps {
  postId: string;
}

const { postId } = defineProps<PostConfirmDeleteDialogButtonProps>();
const { $client } = useNuxtApp();
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
          await $client.post.deletePost.mutate(postId);
          deletePost(postId);
        } finally {
          onComplete();
        }
      }
    "
  />
</template>
