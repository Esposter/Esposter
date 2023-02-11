<script setup lang="ts">
import type { PostWithRelations } from "@/prisma/types";
import dayjs from "dayjs";
import DOMPurify from "dompurify";

interface PostCardProps {
  post: PostWithRelations;
}

const props = defineProps<PostCardProps>();
const { post } = $(toRefs(props));
const { data } = $(useSession());
const createdAt = $computed(() => dayjs(post.createdAt).fromNow());
const sanitizedDescriptionHtml = $computed(() => DOMPurify.sanitize(post.description));
const isOwner = $computed(() => data?.user.id === post.creatorId);
const { surfaceOpacity80 } = useColors();
</script>

<template>
  <StyledCard class="card">
    <PostLikeSection position="absolute" left="2" top="2" :post="post" />
    <v-card px="2!" pt="2!">
      <v-avatar>
        <v-img v-if="post.creator.image" :src="post.creator.image" />
      </v-avatar>
      Posted by <span font="bold">{{ post.creator.name }}</span> <span class="text-grey">{{ createdAt }}</span>
      <v-card-title class="text-h6" px="0!" font="bold!" whitespace="normal!">
        {{ post.title }}
      </v-card-title>
      <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
      <v-card-text class="card-content" px="0!" pb="0!" v-html="sanitizedDescriptionHtml" />
      <v-card-actions p="0!">
        <PostUpdateButton v-if="isOwner" :post-id="post.id" />
        <PostConfirmDeleteDialogButton v-if="isOwner" :post-id="post.id" />
      </v-card-actions>
    </v-card>
  </StyledCard>
</template>

<style scoped lang="scss">
.card {
  padding-left: 2.5rem;
  background-color: v-bind(surfaceOpacity80);
}

:deep(.card-content) {
  ul,
  ol {
    padding: 0 1rem;
  }
}
</style>
