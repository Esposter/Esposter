<script setup lang="ts">
import { RoutePath } from "@esposter/shared";

interface Props {
  postId: string;
}

const { postId } = defineProps<Props>();
</script>

<template>
  <NuxtInvisibleLink :to="RoutePath.PostUpdate(postId)">
    <StyledTooltipIconButton :button-props="{ size: 'small', tile: true }" icon="mdi-pencil" text="Edit Post" />
  </NuxtInvisibleLink>
</template>
