<script setup lang="ts">
import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { PostVoteDefinitionMap } from "@/services/post/PostVoteDefinitionMap";
import { useCommentLikeStore } from "@/store/post/comment/like";
import { useLikeStore } from "@/store/post/like";

interface Props {
  isCommentStore?: true;
  post: PostWithRelations;
  value: CreateLikeInput["value"];
}

const { isCommentStore, post, value } = defineProps<Props>();
const { createLike, deleteLike, updateLike } = isCommentStore ? useCommentLikeStore() : useLikeStore();
const isCast = computed(() => post.viewerLike?.value === value);
const voteDefinition = computed(() => PostVoteDefinitionMap[value]);
</script>

<template>
  <v-btn
    p-0
    rd
    width="1.5rem"
    min-width="1.5rem"
    height="1.5rem"
    @click="
      isCast
        ? deleteLike(post.id)
        : post.viewerLike
          ? updateLike({ postId: post.id, value })
          : createLike({ postId: post.id, value })
    "
  >
    <v-icon
      size="x-large"
      :color="isCast ? voteDefinition.activeColor : undefined"
      :icon="isCast ? voteDefinition.icon : `${voteDefinition.icon}-outline`"
    />
  </v-btn>
</template>
