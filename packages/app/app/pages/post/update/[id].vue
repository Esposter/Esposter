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
            const updatedPost = await updatePost({ id: post.id, ...values });
            // A rejected edit leaves the reader on what they wrote, exactly as a rejected create does
            if (!updatedPost) return;
            // Back to the post that was edited rather than the home feed: every entry point into this form is a
            // Post someone was reading, and dropping them at the top of the feed loses the place they came from
            await navigateTo(RoutePath.Post(post.id));
          }
        "
      />
    </v-container>
  </NuxtLayout>
</template>
