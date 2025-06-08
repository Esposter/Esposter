<script setup lang="ts">
import { usePostStore } from "@/store/post";

const readMorePosts = await useReadPosts();
const postStore = usePostStore();
const { hasMore, posts } = storeToRefs(postStore);
</script>

<template>
  <NuxtLayout>
    <v-pull-to-refresh
      @load="
        async ({ done }) => {
          await useReadPosts();
          done();
        }
      "
    >
      <v-container>
        <v-row>
          <v-col v-for="post of posts" :key="post.id" cols="12">
            <PostCard :post />
          </v-col>
        </v-row>
        <StyledWaypoint :active="hasMore" @change="readMorePosts" />
      </v-container>
    </v-pull-to-refresh>
    <template #left>
      <EsposterProductList />
    </template>
  </NuxtLayout>
</template>
