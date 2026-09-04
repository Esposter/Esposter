<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface Props {
  isLink?: true;
  post: PostWithRelations;
}

const { isLink, post } = defineProps<Props>();
</script>

<template>
  <div space-x-1>
    <NuxtInvisibleLink v-if="isLink" :to="RoutePath.User(post.userId)">
      <StyledAvatar align-middle :image="post.user.image" :name="post.user.name" />
    </NuxtInvisibleLink>
    <StyledAvatar v-else align-middle :image="post.user.image" :name="post.user.name" />
    <span>Posted by</span>
    <NuxtInvisibleLink v-if="isLink" font-bold :to="RoutePath.User(post.userId)">
      {{ post.user.name }}
    </NuxtInvisibleLink>
    <span v-else font-bold>{{ post.user.name }}</span>
    <NuxtTime :datetime="post.createdAt" relative op-medium-emphasis />
  </div>
</template>
