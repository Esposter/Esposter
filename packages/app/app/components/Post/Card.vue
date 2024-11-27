<script setup lang="ts">
import type { PostWithRelations } from "#shared/db/schema/posts";

import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface PostCardProps {
  // into looking for post data in the comment store instead
  isCommentStore?: true;
  // This is only used for the post card in the comments page to direct it
  post: PostWithRelations;
}

const { isCommentStore, post } = defineProps<PostCardProps>();
const { session } = useAuth();
const { surfaceOpacity80 } = useColors();
const createdAtTimeAgo = useTimeAgo(() => post.createdAt);
const isCreator = computed(() => session.value?.user.id === post.userId);
const isEmptyDescription = computed(() => EMPTY_TEXT_REGEX.test(post.description));
</script>

<template>
  <PostConfirmDeleteDialog :post-id="post.id">
    <template #default="{ updateIsOpen }">
      <StyledCard class="card">
        <PostLikeSection absolute top-2 left-2 :post :is-comment-store />
        <v-card px-2="!" pt-2="!">
          <v-avatar>
            <v-img v-if="post.user.image" :src="post.user.image" :alt="post.user.name ?? undefined" />
          </v-avatar>
          Posted by <span font-bold>{{ post.user.name }}</span> <span class="text-grey">{{ createdAtTimeAgo }}</span>
          <v-card-title class="text-h6" px-0="!" font-bold="!" whitespace="normal!">
            {{ post.title }}
          </v-card-title>
          <v-card-text
            v-if="!isEmptyDescription"
            class="text-subtitle-1 card-content"
            px-0="!"
            pb-0="!"
            v-html="post.description"
          />
          <v-card-actions p-0="!">
            <PostCommentsButton :post />
            <PostUpdateButton v-if="isCreator" :post-id="post.id" />
            <PostDeleteButton v-if="isCreator" @update:delete-mode="updateIsOpen" />
          </v-card-actions>
        </v-card>
      </StyledCard>
    </template>
    <template #postPreview>
      <v-card px-2="!" shadow-none="!">
        <v-avatar>
          <v-img v-if="post.user.image" :src="post.user.image" :alt="post.user.name ?? undefined" />
        </v-avatar>
        Posted by <span font-bold>{{ post.user.name }}</span> <span class="text-grey">{{ createdAtTimeAgo }}</span>
        <v-card-title class="text-h6" px-0="!" font-bold="!" whitespace="normal!">
          {{ post.title }}
        </v-card-title>
        <v-card-text
          v-if="!isEmptyDescription"
          class="text-subtitle-1 card-content"
          px-0="!"
          pb-0="!"
          v-html="post.description"
        />
      </v-card>
    </template>
  </PostConfirmDeleteDialog>
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
