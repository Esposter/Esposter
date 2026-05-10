<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";

interface PostCommentCardProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostCommentCardProps>();
const { data: session } = await authClient.useSession(useFetch);
const createdAtTimeAgo = useTimeAgo(() => comment.createdAt);
const isCreator = computed(() => comment.userId === session.value?.user.id);
const isUpdateMode = ref(false);
</script>

<template>
  <PostCommentConfirmDeleteDialog :comment-id="comment.id">
    <template #activator="{ updateIsOpen }">
      <div flex>
        <PostLikeSection :post="comment" is-comment-store pt-2 />
        <v-card flex-1 shadow-none pt-2 px-2>
          <StyledAvatar :image="comment.user.image" :name="comment.user.name" />
          Posted by <span font-bold>{{ comment.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
          <PostCommentUpdateRichTextEditor
            v-if="isUpdateMode"
            mt-2
            :comment
            @update:update-mode="isUpdateMode = $event"
            @update:delete-mode="updateIsOpen"
          />
          <v-card-text v-else class="card-content text-body-large" pb-0 px-0 v-html="comment.description" />
          <v-card-actions p-0>
            <PostCommentUpdateButton v-if="isCreator" @update:update-mode="isUpdateMode = $event" />
            <PostCommentDeleteButton v-if="isCreator" @update:delete-mode="updateIsOpen" />
          </v-card-actions>
        </v-card>
      </div>
    </template>
    <template #commentPreview>
      <v-card shadow-none px-2>
        <StyledAvatar :image="comment.user.image" :name="comment.user.name" />
        Posted by <span font-bold>{{ comment.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
        <v-card-text class="card-content text-body-large" pb-0 px-0 v-html="comment.description" />
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
