<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { RoutePath } from "#shared/models/router/RoutePath";

interface PostCommentsButtonProps {
  post: PostWithRelations;
}

const { post } = defineProps<PostCommentsButtonProps>();
</script>

<template>
  <NuxtInvisibleLink :to="RoutePath.Post(post.id)">
    <v-tooltip text="Comments">
      <template #activator="{ props }">
        <v-btn height="2.5rem" prepend-icon="mdi-comment" :text="post.noComments.toString()" tile :="props" />
      </template>
    </v-tooltip>
  </NuxtInvisibleLink>
</template>
