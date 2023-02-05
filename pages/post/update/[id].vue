<script setup lang="ts">
import { UpsertCardProps } from "@/components/Post/UpsertCard.vue";
import { RoutePath } from "@/models/router";
import { usePostStore } from "@/store/usePostStore";
import { SubmitEventPromise } from "vuetify";

definePageMeta({ middleware: "auth" });

const { $client } = useNuxtApp();
const route = useRoute();
const postId = typeof route.params.id === "string" && uuidValidateV4(route.params.id) ? route.params.id : null;
const post = postId ? await $client.post.readPost.query(postId) : null;
if (!post) throw createError({ statusCode: 404, statusMessage: "Post could not be found" });
const { updatePost } = usePostStore();
const onUpdatePost = async (e: SubmitEventPromise, values: NonNullable<UpsertCardProps["initialValues"]>) => {
  e.preventDefault();
  if (post) {
    const updatedPost = await $client.post.updatePost.mutate({ id: post.id, ...values });
    updatePost(updatedPost);
    await navigateTo(RoutePath.Index);
  }
};
</script>

<template>
  <div>
    <NuxtLayout>
      <v-container>
        <PostUpsertCard
          v-if="post"
          :initial-values="{ title: post.title, description: post.description }"
          @submit="onUpdatePost"
        />
      </v-container>
    </NuxtLayout>
  </div>
</template>
