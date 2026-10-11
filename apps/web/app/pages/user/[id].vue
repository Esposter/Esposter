<script setup lang="ts">
import { getRouteParam } from "@/util/router/getRouteParam";

definePageMeta({ validate: (route) => getRouteParam(route.params, "id").length > 0 });

const route = useRoute();
const userId = route.params.id;
const user = await useReadUser(userId);
const userAchievements = await useReadUserAchievements(userId);
const { readMorePosts, readPosts } = useReadPosts(userId);
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
        <PostFeed
          :empty-description="`A post ${user.name} creates shows up here.`"
          :is-pending
          @read-more="(onComplete) => readMorePosts(onComplete)"
        />
      </section>
    </div>
    <PostConfirmDeleteDialog />
  </NuxtLayout>
</template>
