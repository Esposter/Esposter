<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";

interface PostUpdateButtonProps {
  postId: string;
}

const { postId } = defineProps<PostUpdateButtonProps>();
</script>

<template>
  <NuxtInvisibleLink :to="RoutePath.PostUpdate(postId)">
    <v-btn rd-0="!" icon="mdi-pencil" size="small" />
  </NuxtInvisibleLink>
</template>
