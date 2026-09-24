<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RoutePath } from "@esposter/shared";

interface Props {
  post: PostWithRelations;
}

const { post } = defineProps<Props>();
</script>

<template>
  <!-- On the same track as the vote pill beside it, so the post's footer reads as one row of pills -->
  <div ui-field ui-pill>
    <UiButtonLink
      :to="RoutePath.Post(post.id)"
      :aria-label="`${post.commentCount} ${pluralize('comment', post.commentCount)}`"
      :variant="UiButtonVariant.Quiet"
      ui-pill
    >
      <UiIcon :meaning="UiIconMeaning.Comment" />
      {{ post.commentCount }}
    </UiButtonLink>
  </div>
</template>
