<script setup lang="ts">
import type { PostUpsertFormProps } from "@/components/Post/UpsertForm.vue";
import { RoutePath } from "@/models/router";
import { usePostStore } from "@/store/post";
import type { SubmitEventPromise } from "vuetify";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const { createPost } = usePostStore();
const onCreatePost = async (e: SubmitEventPromise, values: NonNullable<PostUpsertFormProps["initialValues"]>) => {
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
        <PostUpsertForm @submit="onCreatePost" />
      </v-container>
    </NuxtLayout>
  </div>
</template>
