<script setup lang="ts">
import { RoutePath } from "@esposter/shared";

interface PostUpdateButtonProps {
  postId: string;
}

const { postId } = defineProps<PostUpdateButtonProps>();
</script>

<template>
  <NuxtInvisibleLink :to="RoutePath.PostUpdate(postId)">
    <v-tooltip text="Edit Post">
      <template #activator="{ props }">
        <v-btn icon="mdi-pencil" size="small" tile :="props" />
      </template>
    </v-tooltip>
  </NuxtInvisibleLink>
</template>
