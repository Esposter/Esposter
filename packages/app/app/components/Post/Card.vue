<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { usePostDialogStore } from "@/store/post/dialog";

interface PostCardProps {
  // Comments page only: look up post data in the comment store instead.
  isCommentStore?: true;
  post: PostWithRelations;
}

const { isCommentStore, post } = defineProps<PostCardProps>();
const { data: session } = await authClient.useSession(useFetch);
const postDialogStore = usePostDialogStore();
const { deletingId } = storeToRefs(postDialogStore);
const isCreator = computed(() => post.userId === session.value?.user.id);
</script>

<template>
  <StyledCard pl-10 bg-surface-opacity-80>
    <PostLikeSection left-2 top-2 absolute :post :is-comment-store />
    <v-card px-2 pt-2>
      <PostByline is-link :post />
      <v-card-title font-bold px-0 whitespace-normal text-title-large>
        {{ post.title }}
      </v-card-title>
      <PostDescription :description="post.description" />
      <v-card-actions p-0>
        <PostCommentsButton :post />
        <PostUpdateButton v-if="isCreator" :post-id="post.id" />
        <PostDeleteButton v-if="isCreator" @update:delete-mode="deletingId = post.id" />
      </v-card-actions>
    </v-card>
  </StyledCard>
</template>
