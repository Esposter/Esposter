<script setup lang="ts">
import { usePostStore } from "@/store/usePostStore";
import { storeToRefs } from "pinia";

const { $client } = useNuxtApp();
const postStore = usePostStore();
const { initialisePostList } = postStore;
const { postList } = storeToRefs(postStore);
const { posts } = await $client.post.readPosts.query({ cursor: null });

initialisePostList(posts);
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col v-for="(post, index) in postList" :key="index" cols="12">
          <PostCard :post="post" />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
