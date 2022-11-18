<script setup lang="ts">
import { UpsertCardProps } from "@/components/Post/UpsertCard.vue";
import { usePostStore } from "@/store/usePostStore";
import { INDEX_PATH } from "@/util/constants.client";
import { SubmitEventPromise } from "vuetify";

const { $client } = useNuxtApp();
const { createPost } = usePostStore();
const onCreatePost = async (e: SubmitEventPromise, values: NonNullable<UpsertCardProps["initialValues"]>) => {
  e.preventDefault();
  const newPost = await $client.post.createPost.mutate(values);
  createPost(newPost);
  await navigateTo(INDEX_PATH);
};
</script>

<template>
  <NuxtLayout>
    <v-container>
      <PostUpsertCard @submit="onCreatePost" />
    </v-container>
  </NuxtLayout>
</template>
