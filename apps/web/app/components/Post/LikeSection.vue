<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

interface Props {
  post: PostWithRelations;
}

const { post } = defineProps<Props>();
</script>

<template>
  <!-- Reddit's vote pill: both directions and the score between them on one track, each vote clear until it is cast -->
  <div flex items-center ui-field ui-pill>
    <PostVoteButton :post :value="1" />
    <span text-center min-w-6>{{ post.likeCount }}</span>
    <PostVoteButton :post :value="-1" />
  </div>
</template>
