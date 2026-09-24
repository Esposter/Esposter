<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RoutePath } from "@esposter/shared";

interface Props {
  post: PostWithRelations;
}

const { post } = defineProps<Props>();
</script>

<template>
  <UiButtonLink
    :to="RoutePath.Post(post.id)"
    :aria-label="`${post.commentCount} ${pluralize('comment', post.commentCount)}`"
    py-1
  >
    <UiIcon :meaning="UiIconMeaning.Comment" />
    {{ post.commentCount }}
  </UiButtonLink>
</template>
