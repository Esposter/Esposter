<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

interface Props {
  post: PostWithRelations;
}

const { post } = defineProps<Props>();
</script>

<template>
  <div p-3 flex flex-col gap-2 ui-frame>
    <div flex gap-2 items-center>
      <PostAvatar :post />
      <PostByline :post />
    </div>
    <p v-if="post.title" ui-heading>{{ post.title }}</p>
    <PostDescription :description="post.description" />
  </div>
</template>
