<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

interface PostCommentPreviewProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostCommentPreviewProps>();
const createdAtTimeAgo = useTimeAgo(() => comment.createdAt);
</script>

<template>
  <v-card px-2 shadow-none>
    <StyledAvatar :image="comment.user.image" :name="comment.user.name" />
    Posted by <span font-bold>{{ comment.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
    <v-card-text class="rich-text-content" px-0 pb-0 text-body-large v-html="comment.description" />
  </v-card>
</template>
