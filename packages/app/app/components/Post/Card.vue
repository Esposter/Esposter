<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface PostCardProps {
  // This is only used for the post card in the comments page to direct it
  // Into looking for post data in the comment store instead
  isCommentStore?: boolean;
  post: PostWithRelations;
}

const { isCommentStore = false, post } = defineProps<PostCardProps>();
const { data: session } = await authClient.useSession(useFetch);
const { surfaceOpacity80 } = useColors();
const createdAtTimeAgo = useTimeAgo(() => post.createdAt);
const isCreator = computed(() => post.userId === session.value?.user.id);
const isEmptyDescription = computed(() => EMPTY_TEXT_REGEX.test(post.description));
</script>

<template>
  <PostConfirmDeleteDialog :post-id="post.id">
    <template #activator="{ updateIsOpen }">
      <StyledCard class="card">
        <PostLikeSection absolute top-2 left-2 :post :is-comment-store />
        <v-card px-2="!" pt-2="!">
          <StyledAvatar :image="post.user.image" :name="post.user.name" />
          Posted by <span font-bold>{{ post.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
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
        <StyledAvatar :image="post.user.image" :name="post.user.name" />
        Posted by <span font-bold>{{ post.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
        <v-card-title class="text-h6" px-0="!" font-bold="!" whitespace-normal="!">
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
