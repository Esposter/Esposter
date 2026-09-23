<script setup lang="ts">
import { usePostStore } from "@/store/post";

definePageMeta({
  validate: (route) => typeof route.params.id === "string" && route.params.id.length > 0,
});

const { user, userId } = await useReadUserFromRoute();
const userAchievements = await useReadUserAchievements(userId);
const { readMorePosts, readPosts } = useReadPosts(userId);
const postStore = usePostStore();
const { hasMore, items } = storeToRefs(postStore);
await readPosts();
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ user.name }}</Title>
    </Head>
    <div px-4 py-8 flex flex-col gap-8 ui-body>
      <UserProfileHeader :user :user-id />
      <UserProfileAchievementSummary :user-achievements />
      <div flex flex-col gap-6>
        <PostCard v-for="post of items" :key="post.id" :post />
      </div>
      <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMorePosts" />
    </div>
    <PostConfirmDeleteDialog />
  </NuxtLayout>
</template>
