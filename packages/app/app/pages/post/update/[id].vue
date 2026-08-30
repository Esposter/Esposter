<script setup lang="ts">
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { usePostStore } from "@/store/post";
import { DatabaseEntityType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth", validate: checkIsUuidRouteId });

const post = await useReadPostFromRoute();
// This form edits a title, and a comment has none — reading one as a root is the thread page's business, not
// This page's
if (post.parentId)
  throw createError({
    status: 404,
    statusText: `${getEntityNotFoundStatusMessage(DatabaseEntityType.Post, post.id)}, you might be trying to find a comment`,
  });
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
