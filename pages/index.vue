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
      <v-row>
        <v-col>
          <PostCard :post="post" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <RichTextEditor content="Hello World!" />
        </v-col>
      </v-row>
    </v-container>
    <template #right>Right</template>
  </NuxtLayout>
</template>
