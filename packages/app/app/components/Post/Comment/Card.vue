<script setup lang="ts">
import type { PostWithRelations } from "#shared/db/schema/posts";

import { authClient } from "@/services/auth/authClient";

interface PostCommentCardProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostCommentCardProps>();
const { data: session } = await authClient.useSession(useFetch);
const createdAtTimeAgo = useTimeAgo(() => comment.createdAt);
const isCreator = computed(() => session.value?.user.id === comment.userId);
const isUpdateMode = ref(false);
</script>

<template>
  <PostCommentConfirmDeleteDialog :comment-id="comment.id">
    <template #default="{ updateIsOpen }">
      <div flex>
        <PostLikeSection pt-2 :post="comment" is-comment-store />
        <v-card px-2="!" pt-2="!" flex-1 shadow-none="!">
          <StyledAvatar :image="comment.user.image" :name="comment.user.name" />
          Posted by <span font-bold>{{ comment.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
          <PostCommentUpdateRichTextEditor
            v-if="isUpdateMode"
            mt-2="!"
            :comment
            @update:update-mode="isUpdateMode = $event"
            @update:delete-mode="updateIsOpen"
          />
          <v-card-text v-else class="text-subtitle-1 card-content" px-0="!" pb-0="!" v-html="comment.description" />
          <v-card-actions p-0="!">
            <PostCommentUpdateButton v-if="isCreator" @update:update-mode="isUpdateMode = $event" />
            <PostCommentDeleteButton v-if="isCreator" @update:delete-mode="updateIsOpen" />
          </v-card-actions>
        </v-card>
      </div>
    </template>
    <template #commentPreview>
      <v-card px-2="!" shadow-none="!">
        <StyledAvatar :image="comment.user.image" :name="comment.user.name" />
        Posted by <span font-bold>{{ comment.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
        <v-card-text class="text-subtitle-1 card-content" px-0="!" pb-0="!" v-html="comment.description" />
      </v-card>
    </template>
  </PostCommentConfirmDeleteDialog>
</template>

<style scoped lang="scss">
:deep(.card-content) {
  ul,
  ol {
    padding: 0 1rem;
  }
}
</style>
