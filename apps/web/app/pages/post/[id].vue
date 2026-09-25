<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { useCommentStore } from "@/store/post/comment";

definePageMeta({ validate: checkIsUuidRouteId });

const { data: session } = await authClient.useSession(useFetch);
const post = await useReadPostFromRoute();
const commentStore = useCommentStore();
const { currentPost } = storeToRefs(commentStore);
currentPost.value = post;
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ post.title }}</Title>
    </Head>
    <div v-if="currentPost" px-4 py-6 flex flex-col gap-4 w-full ui-body>
      <PostCard :post="currentPost" is-page />
      <PostCommentCreateRichTextEditor v-if="session" :parent-id="currentPost.id" />
      <UiEmptyState
        v-if="currentPost.commentCount === 0"
        description="Nobody's responded to this post yet. Add your thoughts and get the conversation going."
        :meaning="UiIconMeaning.Comment"
        title="Be the first to comment"
      />
      <section v-else aria-label="Comments" flex flex-col gap-2>
        <PostCommentBranch :parent-id="currentPost.id" :depth="0" />
      </section>
      <PostConfirmDeleteDialog />
      <PostCommentConfirmDeleteDialog />
    </div>
  </NuxtLayout>
</template>
