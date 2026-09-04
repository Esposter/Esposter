<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface Props {
  post: PostWithRelations;
}

const { post } = defineProps<Props>();
</script>

<template>
  <NuxtInvisibleLink :to="RoutePath.Post(post.id)">
    <v-tooltip text="Comments">
      <template #activator="{ props }">
        <v-btn height="2.5rem" prepend-icon="mdi-comment" :text="post.commentCount.toString()" tile :="props" />
      </template>
    </v-tooltip>
  </NuxtInvisibleLink>
</template>
