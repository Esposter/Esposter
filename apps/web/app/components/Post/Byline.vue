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
  <!-- One line whatever the name's length: the name yields, the time keeps its place -->
  <p text-muted flex gap-2 min-w-0>
    <NuxtLink v-if="isLink" :to="RoutePath.User(post.userId)" text-info no-underline truncate hover:underline>
      {{ post.user.name }}
    </NuxtLink>
    <span v-else truncate>{{ post.user.name }}</span>
    <span aria-hidden="true">·</span>
    <NuxtTime :datetime="post.createdAt" shrink-0 relative />
  </p>
</template>
