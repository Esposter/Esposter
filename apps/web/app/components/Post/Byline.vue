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
  <p text-muted flex flex-wrap gap-x-2 min-w-0>
    <NuxtLink v-if="isLink" :to="RoutePath.User(post.userId)" text-info no-underline hover:underline>
      {{ post.user.name }}
    </NuxtLink>
    <span v-else>{{ post.user.name }}</span>
    <span aria-hidden="true">·</span>
    <NuxtTime :datetime="post.createdAt" relative />
  </p>
</template>
