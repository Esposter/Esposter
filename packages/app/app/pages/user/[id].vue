<script setup lang="ts">
import { usePostStore } from "@/store/post";

definePageMeta({
  validate: (route) => typeof route.params.id === "string" && route.params.id.length > 0,
});

const user = await useReadUserFromRoute();
const userAchievements = await useReadUserAchievements(user.id);
const { readMoreUserPosts, readUserPosts } = useReadUserPosts(user.id);
const postStore = usePostStore();
const { hasMore, items } = storeToRefs(postStore);
await readUserPosts();
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ user.name }}</Title>
    </Head>
    <v-container>
      <UserProfileHeader :user />
      <v-divider my-4 />
      <UserProfileAchievementSummary :user-achievements />
      <v-divider my-4 />
      <v-row>
        <v-col v-for="post of items" :key="post.id" cols="12">
          <PostCard :post />
        </v-col>
      </v-row>
      <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMoreUserPosts" />
    </v-container>
    <PostConfirmDeleteDialog />
  </NuxtLayout>
</template>
