<script setup lang="ts">
import { RoutePath } from "@/models/router";
import { usePostStore } from "@/store/post/usePostStore";

interface PostConfirmDeleteDialogButtonProps {
  postId: string;
}

const props = defineProps<PostConfirmDeleteDialogButtonProps>();
const { postId } = $(toRefs(props));
const { $client } = useNuxtApp();
const { deletePost } = usePostStore();
const onDeletePost = async (onComplete: () => void) => {
  try {
    const successful = await $client.post.deletePost.mutate(postId);
    if (successful) deletePost(postId);
    await navigateTo(RoutePath.Index);
  } finally {
    onComplete();
  }
};
</script>

<template>
  <StyledDeleteDialog
    :card-props="{
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
    }"
    @delete="onDeletePost"
  >
    <template #default="{ updateDeleteMode }">
      <v-btn m="0!" rd="0!" icon="mdi-delete" size="small" @click="updateDeleteMode(true)" />
    </template>
  </StyledDeleteDialog>
</template>
