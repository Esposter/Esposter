<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

interface PostLikeSectionProps {
  isCommentStore?: true;
  post: PostWithRelations;
}

const { isCommentStore, post } = defineProps<PostLikeSectionProps>();
</script>

<template>
  <div flex flex-col items-center>
    <PostVoteButton :post :is-comment-store :value="1" />
    {{ post.noLikes }}
    <PostVoteButton :post :is-comment-store :value="-1" />
  </div>
</template>
