<script setup lang="ts">
import type { UpsertCardProps } from "@/components/Post/UpsertCard.vue";
import { RoutePath } from "@/models/router";
import { usePostStore } from "@/store/usePostStore";
import type { SubmitEventPromise } from "vuetify";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const { createPost } = usePostStore();
const onCreatePost = async (e: SubmitEventPromise, values: NonNullable<UpsertCardProps["initialValues"]>) => {
  e.preventDefault();
  const newPost = await $client.post.createPost.mutate(values);
  createPost(newPost);
  await navigateTo(RoutePath.Index);
};
</script>

<template>
  <div>
    <NuxtLayout>
      <v-container>
        <PostUpsertCard @submit="onCreatePost" />
      </v-container>
    </NuxtLayout>
  </div>
</template>
