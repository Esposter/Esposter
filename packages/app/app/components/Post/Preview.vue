<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

interface Props {
  post: PostWithRelations;
}

const { post } = defineProps<Props>();
</script>

<template>
  <v-card px-2 shadow-none>
    <PostByline :post />
    <v-card-title v-if="post.title" font-bold px-0 whitespace-normal text-title-large>
      {{ post.title }}
    </v-card-title>
    <PostDescription :description="post.description" />
  </v-card>
</template>
