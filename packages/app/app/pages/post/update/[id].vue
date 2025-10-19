<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { usePostStore } from "@/store/post";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth", validate });

const post = await useReadPostFromRoute();
const postStore = usePostStore();
const { updatePost } = postStore;
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ post.title }}</Title>
    </Head>
    <v-container>
      <PostUpsertForm
        :initial-values="{ title: post.title, description: post.description }"
        @submit="
          async (_event, values) => {
            await updatePost({ id: post.id, ...values });
            await navigateTo(RoutePath.Index);
          }
        "
      />
    </v-container>
  </NuxtLayout>
</template>
