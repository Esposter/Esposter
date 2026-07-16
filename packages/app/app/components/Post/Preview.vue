<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface PostPreviewProps {
  post: PostWithRelations;
}

const { post } = defineProps<PostPreviewProps>();
const createdAtTimeAgo = useTimeAgo(() => post.createdAt);
const isEmptyDescription = computed(() => EMPTY_TEXT_REGEX.test(post.description));
</script>

<template>
  <v-card px-2 shadow-none>
    <StyledAvatar :image="post.user.image" :name="post.user.name" />
    Posted by <span font-bold>{{ post.user.name }}</span> <span text-gray>{{ createdAtTimeAgo }}</span>
    <v-card-title font-bold px-0 whitespace-normal text-title-large>
      {{ post.title }}
    </v-card-title>
    <v-card-text
      v-if="!isEmptyDescription"
      class="rich-text-content"
      px-0
      pb-0
      text-body-large
      v-html="post.description"
    />
  </v-card>
</template>
