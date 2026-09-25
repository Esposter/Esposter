<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { PostWithRelations } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { usePostDialogStore } from "@/store/post/dialog";
import { RoutePath } from "@esposter/shared";

interface Props {
  // The post's own page, whose heading its title is rather than a link to it
  isPage?: true;
  post: PostWithRelations;
}

const { isPage, post } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const postDialogStore = usePostDialogStore();
const { deletingId } = storeToRefs(postDialogStore);
const isCreator = computed(() => post.userId === session.value?.user.id);
const items: Item[] = [
  {
    meaning: UiIconMeaning.Edit,
    onClick: async () => {
      await navigateTo(RoutePath.PostUpdate(post.id));
    },
    title: "Edit",
  },
  {
    isDanger: true,
    meaning: UiIconMeaning.Delete,
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
  <!-- Reddit's card: who and when with the actions at the end, the post, then voting and the comments under it, as
    One card of the feed. A reader who did not write it has no actions, so the browser keeps its own menu there -->
  <article :="isCreator ? contextMenuProps : {}" p-3 flex flex-col gap-2 ui-frame>
    <header flex gap-2 items-center>
      <PostAvatar is-link :post />
      <PostByline is-link :post flex-1 />
      <UiOverflowMenu v-if="isCreator" :items label="Post actions" />
    </header>
    <h1 v-if="isPage" ui-title>{{ post.title }}</h1>
    <h2 v-else ui-heading>
      <NuxtLink :to="RoutePath.Post(post.id)" text-inherit no-underline hover:underline>{{ post.title }}</NuxtLink>
    </h2>
    <PostDescription :description="post.description" />
    <footer flex gap-2 items-center>
      <PostLikeSection :post />
      <PostCommentsButton :post />
    </footer>
  </article>
</template>
