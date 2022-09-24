<script setup lang="ts">
import { Post } from "@prisma/client";

const post: Partial<Post> = {
  title: "Hello!",
  description: "Lorem Ipsum",
};
</script>

<template>
  <NuxtLayout chatbot>
    <template #left>Left</template>
    <v-container>
      <PostCard :post="post" />
    </v-container>
  </NuxtLayout>
</template>
