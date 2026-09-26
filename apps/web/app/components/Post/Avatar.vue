<script setup lang="ts">
import type { PostWithRelations } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface Props {
  isLink?: true;
  post: PostWithRelations;
}

const { isLink, post } = defineProps<Props>();
</script>

<template>
  <!-- The name beside it is the same link, so the picture is one stop for a pointer and none for the keyboard. It
    Stays in the accessibility tree, named for the user, since a click still focuses it -->
  <NuxtInvisibleLink
    v-if="isLink"
    :to="RoutePath.User(post.userId)"
    :aria-label="post.user.name"
    tabindex="-1"
    shrink-0
  >
    <UiAvatar :image="post.user.image ?? ''" :name="post.user.name" />
  </NuxtInvisibleLink>
  <UiAvatar v-else :image="post.user.image ?? ''" :name="post.user.name" />
</template>
