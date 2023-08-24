<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { usePostStore } from "@/store/post";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const { createPost } = usePostStore();
</script>

<template>
  <div>
    <NuxtLayout>
      <v-container>
        <PostUpsertForm
          @submit="
            async (_, values) => {
              const newPost = await $client.post.createPost.mutate(values);
              createPost(newPost);
              await navigateTo(RoutePath.Index);
            }
          "
        />
      </v-container>
    </NuxtLayout>
  </div>
</template>
