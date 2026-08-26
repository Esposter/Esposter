<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { authClient } from "@/services/auth/authClient";
import { COMMENT_INDENT_STEP, MAX_COMMENT_INDENT_DEPTH } from "@/services/post/constants";
import { useCommentDialogStore } from "@/store/post/comment/dialog";
import { RoutePath } from "@esposter/shared";

interface PostCommentCardProps {
  comment: PostWithRelations;
  depth: number;
}

const { comment, depth } = defineProps<PostCommentCardProps>();
// The synchronous form, not the awaited one: everything it decides here is an action affordance rather than
// Content, and a tree renders one of these per node — an awaited session makes every node an async boundary
const session = authClient.useSession();
const commentDialogStore = useCommentDialogStore();
const { replyingId } = storeToRefs(commentDialogStore);
const { setDeletingComment } = commentDialogStore;
const isCreator = computed(() => comment.userId === session.value.data?.user.id);
const isUpdateMode = ref(false);
const isExpanded = ref(false);
// Indentation stops moving right at the clamp while the nesting carries on, so a thread deeper than the screen
// Is wide offers its own page instead of a column of text one word across
const isClamped = computed(() => depth >= MAX_COMMENT_INDENT_DEPTH);
const replyLabel = computed(() => `${comment.noComments} ${pluralize("reply", comment.noComments, "replies")}`);
</script>

<template>
  <div :style="{ marginLeft: depth > 0 && !isClamped ? COMMENT_INDENT_STEP : '' }">
    <div flex>
      <PostLikeSection :post="comment" is-comment-store pt-2 />
      <v-card px-2 pt-2 flex-1 shadow-none>
        <PostByline is-link :post="comment" />
        <PostCommentUpdateRichTextEditor
          v-if="isUpdateMode"
          mt-2
          :comment
          @update:update-mode="isUpdateMode = $event"
          @update:delete-mode="setDeletingComment(comment)"
        />
        <PostDescription v-else :description="comment.description" />
        <v-card-actions p-0>
          <StyledTooltipIconButton
            v-if="session.data"
            :button-props="{ size: 'small', tile: true }"
            icon="mdi-reply"
            text="Reply"
            @click="replyingId = replyingId === comment.id ? '' : comment.id"
          />
          <StyledTooltipIconButton
            v-if="isCreator"
            :button-props="{ size: 'small', tile: true }"
            icon="mdi-pencil"
            text="Edit Comment"
            @click="isUpdateMode = true"
          />
          <StyledTooltipIconButton
            v-if="isCreator"
            :button-props="{ size: 'small', tile: true }"
            icon="mdi-delete"
            :text="comment.noComments > 0 ? 'Delete Comment And Replies' : 'Delete Comment'"
            @click="setDeletingComment(comment)"
          />
          <!-- Collapsed until asked for, so opening a branch is what reads it. Past the indent clamp the thread
          carries on somewhere it has room, which is its own page — a comment is a post and already has one -->
          <v-btn
            v-if="comment.noComments > 0 && !isClamped"
            size="small"
            variant="text"
            :prepend-icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            :text="replyLabel"
            @click="isExpanded = !isExpanded"
          />
          <v-btn
            v-else-if="comment.noComments > 0"
            size="small"
            variant="text"
            append-icon="mdi-arrow-right"
            text="Continue this thread"
            :to="RoutePath.Post(comment.id)"
          />
        </v-card-actions>
        <PostCommentCreateRichTextEditor v-if="replyingId === comment.id" :parent-id="comment.id" pb-2 />
      </v-card>
    </div>
    <!-- The read is the branch's own, so the boundary is too: without one every expansion anywhere in the tree
    suspends the page that mounted it -->
    <Suspense v-if="isExpanded">
      <PostCommentBranch :parent-id="comment.id" :depth="depth + 1" />
      <template #fallback>
        <StyledSkeleton />
      </template>
    </Suspense>
  </div>
</template>
