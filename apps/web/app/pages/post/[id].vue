<script setup lang="ts">
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { checkIsUuidRouteId } from "#src/services/router/checkIsUuidRouteId";
import { useCommentStore } from "#src/store/post/comment/index";

definePageMeta({ validate: checkIsUuidRouteId });

const { data: session } = await useAuthSession();
const { $trpc } = useNuxtApp();
const route = useRoute();
const commentStore = useCommentStore();
const { commentSortType, currentPost } = storeToRefs(commentStore);
const { openPost } = commentStore;
const { executeQuery } = useMutation();
// A comment is a post, so this returns one either way: opening a reply's own id renders it as the root of its
// Thread with its replies beneath, which is what "continue this thread" is — the same page, one level of
// Context instead of ten, and no route of its own. The read stays live, and a write's refresh replaces the post
// Without reopening it, so the reader's expanded replies and sort survive an edit
const outcome = await executeQuery(() => $trpc.post.readPost.query(route.params.id), {
  key: route.params.id,
  onError: console.error,
  onSuccess: (newPost) => {
    currentPost.value = newPost;
  },
});
// The page exists only for a post that could be read, so the first read's failure is the error page, and its success
// Opens the post afresh, whatever thread the store still held from an earlier visit
if (outcome.status === MutationStatus.Failed) throw outcome.error;
if (outcome.status === MutationStatus.Succeeded) openPost(outcome.result);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>{{ currentPost?.title }}</Title>
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
        <PostCommentSortSelect self-start />
        <!-- A new sort is read from the first page, which a branch does only when it is mounted, so the thread remounts -->
        <PostCommentBranch :key="commentSortType" :parent-id="currentPost.id" :depth="0" />
      </section>
      <PostConfirmDeleteDialog />
      <PostCommentConfirmDeleteDialog />
    </div>
  </NuxtLayout>
</template>
