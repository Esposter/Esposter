<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { usePostStore } from "@/store/post";

definePageMeta({ middleware: "auth" });

const postStore = usePostStore();
const { createPost } = postStore;
</script>

<template>
  <div>
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
  </div>
</template>
