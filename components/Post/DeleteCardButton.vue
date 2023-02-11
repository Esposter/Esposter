<script setup lang="ts">
import { RoutePath } from "@/models/router";
import { usePostStore } from "@/store/post/usePostStore";

interface DeleteCardButtonProps {
  postId: string;
}

const props = defineProps<DeleteCardButtonProps>();
const { postId } = $(toRefs(props));
const { $client } = useNuxtApp();
const { deletePost } = usePostStore();
const onDeletePost = async () => {
  const successful = await $client.post.deletePost.mutate(postId);
  if (successful) deletePost(postId);
  await navigateTo(RoutePath.Index);
};
</script>

<template>
  <v-btn m="0!" rd="0!" icon="mdi-delete" size="small" @click="onDeletePost" />
</template>
