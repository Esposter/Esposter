<script setup lang="ts">
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { getEditDeleteItems } from "#src/services/ui/getEditDeleteItems";
import { usePostDialogStore } from "#src/store/post/dialog";
import { RoutePath } from "@esposter/shared";

interface Props {
  // The post's own page, whose heading its title is rather than a link to it
  isPage?: true | undefined;
  post: PostInPostWithRelations;
}

const { post } = defineProps<Props>();
const { data: session } = await useAuthSession();
const postDialogStore = usePostDialogStore();
const { deletingId } = storeToRefs(postDialogStore);
const isCreator = computed(() => post.userId === session.value?.user.id);
// The overflow button and the context menu draw these labels, so one object names both
const editDeleteLabels = { deleteLabel: "Delete", editLabel: "Edit" };
const onDelete = () => {
  deletingId.value = post.id;
};
const onEdit = async () => {
  await navigateTo(RoutePath.PostUpdate(post.id));
};
const { getContextMenuProps } = useContextMenu();
const contextMenuProps = getContextMenuProps(post.id, () =>
  getEditDeleteItems({ ...editDeleteLabels, onDelete, onEdit }),
);
</script>

<template>
  <!-- Reddit's card: who and when with the actions at the end, the post, then voting and the comments under it, as
    One card of the feed. A reader who did not write it has no actions, so the browser keeps its own menu there -->
  <article :="isCreator ? contextMenuProps : {}" p-3 flex flex-col gap-2 ui-frame>
    <header flex gap-2 items-center>
      <PostAvatar is-link :post />
      <PostByline is-link :post flex-1 />
      <UiEditDeleteMenu
        v-if="isCreator"
        :="editDeleteLabels"
        label="Post actions"
        @delete="onDelete()"
        @edit="onEdit()"
      />
    </header>
    <h1 v-if="isPage" ui-title>{{ post.title }}</h1>
    <h2 v-else ui-heading>
      <NuxtLink :to="RoutePath.Post(post.id)" text-info no-underline hover:underline>{{ post.title }}</NuxtLink>
    </h2>
    <PostDescription :description="post.description" />
    <footer flex gap-2 items-center>
      <PostLikeSection :post />
      <PostCommentsButton :post />
    </footer>
  </article>
</template>
