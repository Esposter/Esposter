<script setup lang="ts">
import { RoutePath } from "#shared/models/router/RoutePath";

interface PostUpdateButtonProps {
  postId: string;
}

const { postId } = defineProps<PostUpdateButtonProps>();
</script>

<template>
  <NuxtInvisibleLink :to="RoutePath.PostUpdate(postId)">
    <v-tooltip text="Edit Post">
      <template #activator="{ props }">
        <v-btn rd-none="!" icon="mdi-pencil" size="small" :="props" />
      </template>
    </v-tooltip>
  </NuxtInvisibleLink>
</template>
