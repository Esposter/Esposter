<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useCommentDialogStore } from "@/store/post/comment/dialog";
import { RoutePath } from "@esposter/shared";

interface PostCommentCardProps {
  comment: PostWithRelations;
}

const { comment } = defineProps<PostCommentCardProps>();
const { data: session } = await authClient.useSession(useFetch);
const commentDialogStore = useCommentDialogStore();
const { deletingId } = storeToRefs(commentDialogStore);
const createdAtTimeAgo = useTimeAgo(() => comment.createdAt);
const isCreator = computed(() => comment.userId === session.value?.user.id);
const isUpdateMode = ref(false);
</script>

<template>
  <div flex>
    <PostLikeSection :post="comment" is-comment-store pt-2 />
    <v-card px-2 pt-2 flex-1 shadow-none>
      <NuxtInvisibleLink :to="RoutePath.User(comment.userId)">
        <StyledAvatar :image="comment.user.image" :name="comment.user.name" />
      </NuxtInvisibleLink>
      Posted by
      <NuxtInvisibleLink font-bold :to="RoutePath.User(comment.userId)">{{ comment.user.name }}</NuxtInvisibleLink>
      <span text-gray>{{ createdAtTimeAgo }}</span>
      <PostCommentUpdateRichTextEditor
        v-if="isUpdateMode"
        mt-2
        :comment
        @update:update-mode="isUpdateMode = $event"
        @update:delete-mode="deletingId = comment.id"
      />
      <v-card-text v-else class="rich-text-content" px-0 pb-0 text-body-large v-html="comment.description" />
      <v-card-actions p-0>
        <PostCommentUpdateButton v-if="isCreator" @update:update-mode="isUpdateMode = $event" />
        <PostCommentDeleteButton v-if="isCreator" @update:delete-mode="deletingId = comment.id" />
      </v-card-actions>
    </v-card>
  </div>
</template>
