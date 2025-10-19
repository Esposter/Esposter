<script setup lang="ts">
import { usePostStore } from "@/store/post";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

const postStore = usePostStore();
const { createPost } = postStore;
</script>

<template>
  <NuxtLayout>
    <v-container>
      <PostUpsertForm
        @submit="
          async (_event, values) => {
            await createPost(values);
            await navigateTo(RoutePath.Index);
          }
        "
      />
    </v-container>
  </NuxtLayout>
</template>
