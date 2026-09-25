<script setup lang="ts">
import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { PostVoteDefinitionMap } from "@/services/post/PostVoteDefinitionMap";
import { useLikeStore } from "@/store/post/like";

interface Props {
  post: PostWithRelations;
  value: CreateLikeInput["value"];
}

const { post, value } = defineProps<Props>();
const likeStore = useLikeStore();
const { createLike, deleteLike, updateLike } = likeStore;
const isCast = computed(() => post.viewerLike?.value === value);
const voteDefinition = computed(() => PostVoteDefinitionMap[value]);
</script>

<template>
  <!-- A toggle: pressed while it is the reader's vote, which pressing again withdraws -->
  <UiIconButton
    :aria-pressed="isCast"
    :label="voteDefinition.label"
    :meaning="voteDefinition.meaning"
    :variant="isCast ? voteDefinition.castVariant : UiButtonVariant.Quiet"
    ui-pill
    @click="
      isCast
        ? deleteLike(post.id)
        : post.viewerLike
          ? updateLike({ postId: post.id, value })
          : createLike({ postId: post.id, value })
    "
  />
</template>
