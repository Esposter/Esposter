<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";
import { usePostStore } from "@/store/post";
import { uuidValidateV4 } from "@/util/uuid";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const route = useRoute();
const postId = typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
const post = postId ? await $client.post.readPost.query(postId) : null;
if (!post) throw createError({ statusCode: 404, statusMessage: "Post could not be found" });

const { updatePost } = usePostStore();
</script>

<template>
  <div>
    <NuxtLayout>
      <v-container>
        <PostUpsertForm
          v-if="post"
          :initial-values="{ title: post.title, description: post.description }"
          @submit="
            async (_, values) => {
              if (post) {
                const updatedPost = await $client.post.updatePost.mutate({ id: post.id, ...values });
                if (updatedPost) updatePost(updatedPost);
                await navigateTo(RoutePath.Index);
              }
            }
          "
        />
      </v-container>
    </NuxtLayout>
  </div>
</template>
