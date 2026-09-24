<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { PostWithRelations } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { MAX_COMMENT_INDENT_DEPTH } from "@/services/post/constants";
import { useCommentDialogStore } from "@/store/post/comment/dialog";
import { RoutePath } from "@esposter/shared";

interface Props {
  comment: PostWithRelations;
  depth: number;
}

const { comment, depth } = defineProps<Props>();
// The synchronous form: a tree renders one of these per node, and the awaited one makes every node an async
// Boundary for something that only gates action affordances
const session = authClient.useSession();
const commentDialogStore = useCommentDialogStore();
const { replyingId } = storeToRefs(commentDialogStore);
const { setDeletingComment } = commentDialogStore;
const isCreator = computed(() => comment.userId === session.value.data?.user.id);
const isUpdateMode = ref(false);
const isExpanded = ref(false);
// Past the clamp a thread goes on on its own page rather than further in
const isClamped = computed(() => depth >= MAX_COMMENT_INDENT_DEPTH);
const repliesId = useId();
const items: Item[] = [
  {
    icon: "i-mdi:pencil",
    onClick: () => {
      isUpdateMode.value = true;
    },
    title: "Edit",
  },
  {
    color: "error",
    icon: "i-mdi:delete",
    onClick: () => {
      setDeletingComment(comment);
    },
    title: "Delete",
  },
];
const { getContextMenuProps } = useContextMenu();
const contextMenuProps = getContextMenuProps(comment.id, () => items);
</script>

<template>
  <!-- Reddit's thread: a line runs down from a comment's picture past everything under it, so which comment a reply
    Answers stays visible however deep it sits -->
  <div>
    <div flex gap-2>
      <div flex shrink-0 flex-col>
        <PostAvatar is-link :post="comment" />
        <div v-if="isExpanded" ml-4 bg-border flex-1 w="[var(--ui-border-width)]" />
      </div>
      <div :="isCreator ? contextMenuProps : {}" pb-2 flex flex-1 flex-col gap-1 min-w-0>
        <PostByline is-link :post="comment" />
        <PostCommentUpdateRichTextEditor
          v-if="isUpdateMode"
          :comment
          @update:update-mode="isUpdateMode = $event"
          @update:delete-mode="setDeletingComment(comment)"
        />
        <PostDescription v-else :description="comment.description" />
        <div flex flex-wrap gap-2 items-center>
          <PostLikeSection :post="comment" is-comment-store />
          <UiButton
            v-if="session.data"
            :aria-expanded="replyingId === comment.id"
            :variant="UiButtonVariant.Quiet"
            flex
            gap-1
            @click="replyingId = replyingId === comment.id ? '' : comment.id"
          >
            <UiIcon :meaning="UiIconMeaning.Reply" />
            Reply
          </UiButton>
          <UiOverflowMenu v-if="isCreator" :items label="Comment actions" />
        </div>
        <PostCommentCreateRichTextEditor v-if="replyingId === comment.id" :parent-id="comment.id" />
        <UiButton
          v-if="comment.commentCount > 0 && !isClamped"
          :aria-controls="repliesId"
          :aria-expanded="isExpanded"
          :variant="UiButtonVariant.Quiet"
          py-1
          flex
          gap-1
          items-center
          self-start
          @click="isExpanded = !isExpanded"
        >
          <UiIcon :class="{ 'rotate-90': isExpanded }" :meaning="UiIconMeaning.Disclosure" />
          {{ comment.commentCount }} {{ pluralize("reply", comment.commentCount, "replies") }}
        </UiButton>
        <NuxtLink
          v-else-if="comment.commentCount > 0"
          :to="RoutePath.Post(comment.id)"
          text-info
          no-underline
          flex
          gap-1
          items-center
          self-start
          hover:underline
        >
          Continue this thread
          <UiIcon :meaning="UiIconMeaning.Next" />
        </NuxtLink>
      </div>
    </div>
    <!-- Always there for the toggle to name, and read only once opened. Without a boundary of its own, every
      Expansion anywhere in the tree suspends the page that mounted it -->
    <div v-show="isExpanded" :id="repliesId" ml-4 pl-4 ui-guide>
      <Suspense v-if="isExpanded">
        <PostCommentBranch :parent-id="comment.id" :depth="depth + 1" />
        <template #fallback>
          <UiSkeleton h-16 />
        </template>
      </Suspense>
    </div>
  </div>
</template>
