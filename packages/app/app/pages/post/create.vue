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
        is-create
        @submit="
          async (_event, values) => {
            const newPost = await createPost(values);
            // A rejected create leaves the reader on their own draft rather than on a feed without it — the
            // Error alert is already up, so there is nothing to say and everything still to submit
            if (!newPost) return;
            await navigateTo(RoutePath.Post(newPost.id));
          }
        "
      />
    </v-container>
  </NuxtLayout>
</template>
