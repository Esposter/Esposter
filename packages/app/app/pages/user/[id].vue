<script setup lang="ts">
import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";
import { usePostStore } from "@/store/post";

definePageMeta({
  validate: (route) => typeof route.params.id === "string" && route.params.id.length > 0,
});

const { $trpc } = useNuxtApp();
const route = useRoute();
const id = route.params.id as string;
const { readMoreUserPosts, readUserPosts } = useReadUserPosts(id);
const postStore = usePostStore();
const { hasMore, items } = storeToRefs(postStore);
const user = await $trpc.user.readUser.query(id);
const userAchievements = (await $trpc.achievement.readUserAchievements.query(id)).map((userAchievement) =>
  mapToUserAchievementWithDefinition(userAchievement, AchievementDefinitionMap[userAchievement.achievement.name]),
);
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
