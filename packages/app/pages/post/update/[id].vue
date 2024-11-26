<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { RoutePath } from "@/shared/models/router/RoutePath";
import { usePostStore } from "@/store/post";

definePageMeta({ middleware: "auth", validate });

const post = await useReadPostFromRoute();
const { updatePost } = usePostStore();
</script>

<template>
  <div>
    <NuxtLayout>
      <v-container>
        <PostUpsertForm
          :initial-values="{ title: post.title, description: post.description }"
          @submit="
            async (_, values) => {
              await updatePost({ id: post.id, ...values });
              await navigateTo(RoutePath.Index);
            }
          "
        />
      </v-container>
    </NuxtLayout>
  </div>
</template>
