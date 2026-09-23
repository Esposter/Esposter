<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

interface Props {
  isCommentStore?: true;
  post: PostWithRelations;
}

const { isCommentStore, post } = defineProps<Props>();
</script>

<template>
  <div flex gap-1 items-center>
    <PostVoteButton :post :is-comment-store :value="1" />
    <span text-center min-w-6>{{ post.likeCount }}</span>
    <PostVoteButton :post :is-comment-store :value="-1" />
  </div>
</template>
