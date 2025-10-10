<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useCommentLikeStore } from "@/store/post/comment/like";
import { useLikeStore } from "@/store/post/like";

interface PostLikeSectionProps {
  isCommentStore?: boolean;
  post: PostWithRelations;
}

const { isCommentStore = false, post } = defineProps<PostLikeSectionProps>();
const { data: session } = await authClient.useSession(useFetch);
const likeStore = isCommentStore ? useCommentLikeStore() : useLikeStore();
const { createLike, deleteLike, updateLike } = likeStore;
const liked = computed(() => post.likes.some(({ userId, value }) => userId === session.value?.user.id && value === 1));
const unliked = computed(() =>
  post.likes.some(({ userId, value }) => userId === session.value?.user.id && value === -1),
);
</script>

<template>
  <div flex flex-col items-center>
    <v-btn
      p-0="!"
      rd="!"
      bg-transparent="!"
      width="1.5rem"
      min-width="1.5rem"
      height="1.5rem"
      @click="
        liked
          ? deleteLike(post.id)
          : unliked
            ? updateLike({ postId: post.id, value: 1 })
            : createLike({ postId: post.id, value: 1 })
      "
    >
      <v-icon
        size="x-large"
        :color="liked ? 'primary' : undefined"
        :icon="liked ? 'mdi-arrow-up-bold' : 'mdi-arrow-up-bold-outline'"
      />
    </v-btn>
    {{ post.noLikes }}
    <v-btn
      p-0="!"
      rd="!"
      bg-transparent="!"
      width="1.5rem"
      min-width="1.5rem"
      height="1.5rem"
      @click="
        unliked
          ? deleteLike(post.id)
          : liked
            ? updateLike({ postId: post.id, value: -1 })
            : createLike({ postId: post.id, value: -1 })
      "
    >
      <v-icon
        size="x-large"
        :color="unliked ? 'error' : undefined"
        :icon="unliked ? 'mdi-arrow-down-bold' : 'mdi-arrow-down-bold-outline'"
      />
    </v-btn>
  </div>
</template>
