<script setup lang="ts">
import { usePostStore } from "@/store/usePostStore";
import { INDEX_PATH } from "@/util/constants.client";

interface ConfirmDeleteDialogButtonProps {
  postId: string;
}

const props = defineProps<ConfirmDeleteDialogButtonProps>();
const { postId } = $(toRefs(props));
const { $client } = useNuxtApp();
const { deletePost } = usePostStore();
const onDeletePost = async (onComplete: () => void) => {
  try {
    const successful = await $client.post.deletePost.mutate(postId);
    if (successful) deletePost(postId);
    await navigateTo(INDEX_PATH);
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
