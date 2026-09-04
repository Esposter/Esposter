<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { authClient } from "@/services/auth/authClient";
import { COMMENT_INDENT_STEP, MAX_COMMENT_INDENT_DEPTH } from "@/services/post/constants";
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
// Indentation stops at the clamp while the nesting carries on
const isClamped = computed(() => depth >= MAX_COMMENT_INDENT_DEPTH);
const replyLabel = computed(() => `${comment.commentCount} ${pluralize("reply", comment.commentCount, "replies")}`);
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
            :text="comment.commentCount > 0 ? 'Delete Comment And Replies' : 'Delete Comment'"
            @click="setDeletingComment(comment)"
          />
          <v-btn
            v-if="comment.commentCount > 0 && !isClamped"
            size="small"
            variant="text"
            :prepend-icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            :text="replyLabel"
            @click="isExpanded = !isExpanded"
          />
          <v-btn
            v-else-if="comment.commentCount > 0"
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
    <!-- Without a boundary of its own, every expansion anywhere in the tree suspends the page that mounted it -->
    <Suspense v-if="isExpanded">
      <PostCommentBranch :parent-id="comment.id" :depth="depth + 1" />
      <template #fallback>
        <StyledSkeleton />
      </template>
    </Suspense>
  </div>
</template>
