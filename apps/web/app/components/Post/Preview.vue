<script setup lang="ts">
import type { PostInPostWithRelations } from "@esposter/db-schema";

interface Props {
  post: PostInPostWithRelations;
}

const { post } = defineProps<Props>();
</script>

<template>
  <!-- Quoted inside the dialog that asks about it rather than framed in its frame: a guide down its start edge -->
  <div pl-3 flex flex-col gap-2 ui-guide>
    <div flex gap-2 items-center>
      <PostAvatar :post />
      <PostByline :post />
    </div>
    <p v-if="post.title" ui-heading>{{ post.title }}</p>
    <PostDescription :description="post.description" />
  </div>
</template>
