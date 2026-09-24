<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { POST_SKELETON_COUNT } from "@/services/post/constants";
import { usePostStore } from "@/store/post";

definePageMeta({
  validate: (route) => typeof route.params.id === "string" && route.params.id.length > 0,
});

const { user, userId } = await useReadUserFromRoute();
const userAchievements = await useReadUserAchievements(userId);
const { readMorePosts, readPosts } = useReadPosts(userId);
const postStore = usePostStore();
const { hasMore, items } = storeToRefs(postStore);
const { isPending } = await readPosts();
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ user.name }}</Title>
    </Head>
    <div px-4 py-6 flex flex-col gap-8 ui-body>
      <UserProfileHeader :user :user-id />
      <UserProfileAchievementSummary :user-achievements />
      <section flex flex-col gap-4>
        <h2 ui-heading>Posts</h2>
        <div v-if="isPending && items.length === 0" aria-busy="true" flex flex-col gap-4>
          <PostCardSkeleton v-for="index of POST_SKELETON_COUNT" :key="index" />
        </div>
        <PostCard v-for="post of items" :key="post.id" :post />
        <UiEmptyState
          v-if="!isPending && items.length === 0"
          :description="`A post ${user.name} creates shows up here.`"
          :meaning="UiIconMeaning.Comment"
          title="Nothing posted yet"
        />
        <StyledWaypoint flex justify-center :is-active="hasMore" @change="readMorePosts" />
      </section>
    </div>
    <PostConfirmDeleteDialog />
  </NuxtLayout>
</template>
