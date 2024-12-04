<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";
import { usePostStore } from "@/store/post";

definePageMeta({ middleware: "auth" });

const { createPost } = usePostStore();
</script>

<template>
  <div>
    <NuxtLayout>
      <v-container>
        <PostUpsertForm
          @submit="
            async (_, values) => {
              await createPost(values);
              await navigateTo(RoutePath.Index);
            }
          "
        />
      </v-container>
    </NuxtLayout>
  </div>
</template>
