<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

interface Props {
  isCommentStore?: true;
  post: PostWithRelations;
}

const { isCommentStore, post } = defineProps<Props>();
</script>

<template>
  <div flex flex-col items-center>
    <PostVoteButton :post :is-comment-store :value="1" />
    {{ post.likeCount }}
    <PostVoteButton :post :is-comment-store :value="-1" />
  </div>
</template>
