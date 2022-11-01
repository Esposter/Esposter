<script setup lang="ts">
import { storeToRefs } from "pinia";
import { testPost } from "@/server/trpc/routers";
import { usePostStore } from "@/store/usePostStore";

const postStore = usePostStore();
const { initialisePostList } = postStore;
const { postList } = storeToRefs(postStore);

initialisePostList([testPost]);
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
