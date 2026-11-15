<script setup lang="ts">
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useCommentStore } from "#src/store/post/comment/index";

interface Props {
  comment: PostInPostWithRelations;
  isExpanded: boolean;
  repliesId: string;
}

defineProps<Props>();
const commentStore = useCommentStore();
const { toggleCommentExpanded } = commentStore;
</script>

<template>
  <UiButton
    :aria-controls="repliesId"
    :aria-expanded="isExpanded"
    :variant="UiButtonVariant.Quiet"
    @click="toggleCommentExpanded(comment.id)"
  >
    <UiIcon :class="{ 'rotate-90': isExpanded }" :meaning="UiIconMeaning.Disclosure" />
    {{ comment.commentCount }} {{ pluralize("reply", comment.commentCount, "replies") }}
  </UiButton>
</template>
