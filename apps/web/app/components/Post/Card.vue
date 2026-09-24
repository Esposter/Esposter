<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { PostWithRelations } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { usePostDialogStore } from "@/store/post/dialog";
import { RoutePath } from "@esposter/shared";

interface Props {
  // The post's own page: its data is the comment store's, and its title is the page's heading rather than a link
  isCommentStore?: true;
  post: PostWithRelations;
}

const { isCommentStore, post } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const postDialogStore = usePostDialogStore();
const { deletingId } = storeToRefs(postDialogStore);
const isCreator = computed(() => post.userId === session.value?.user.id);
const items: Item[] = [
  {
    icon: "i-mdi:pencil",
    onClick: async () => {
      await navigateTo(RoutePath.PostUpdate(post.id));
    },
    title: "Edit",
  },
  {
    color: "error",
    icon: "i-mdi:delete",
    onClick: () => {
      deletingId.value = post.id;
    },
    title: "Delete",
  },
];
const { getContextMenuProps } = useContextMenu();
const contextMenuProps = getContextMenuProps(post.id, () => items);
</script>

<template>
  <!-- Reddit's card: who and when with the actions at the end, the post, then voting and the comments under it. A
    Reader who did not write it has no actions, so the browser keeps its own menu there -->
  <article :="isCreator ? contextMenuProps : {}" p-3 flex flex-col gap-2 ui-frame>
    <header flex gap-2 items-center>
      <PostAvatar is-link :post />
      <PostByline is-link :post flex-1 />
      <UiOverflowMenu v-if="isCreator" :items label="Post actions" />
    </header>
    <h1 v-if="isCommentStore" ui-title>{{ post.title }}</h1>
    <h2 v-else ui-heading>
      <NuxtLink :to="RoutePath.Post(post.id)" text-inherit no-underline hover:underline>{{ post.title }}</NuxtLink>
    </h2>
    <PostDescription :description="post.description" />
    <footer flex flex-wrap gap-2 items-center>
      <PostLikeSection :post :is-comment-store />
      <PostCommentsButton :post />
    </footer>
  </article>
</template>
