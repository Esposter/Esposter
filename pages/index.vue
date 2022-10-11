<script setup lang="ts">
import { storeToRefs } from "pinia";
import { usePostStore } from "@/store/usePostStore";

const postStore = usePostStore();
const { postList } = storeToRefs(postStore);
</script>

<template>
  <NuxtLayout chatbot>
    <template #left>Left</template>
    <v-container>
      <v-row>
        <v-col v-for="(post, index) in postList" :key="index" cols="12">
          <PostCard :post="post" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <RichTextEditor />
        </v-col>
      </v-row>
    </v-container>
    <template #right>Right</template>
  </NuxtLayout>
</template>
