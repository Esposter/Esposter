<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";

interface PostUpdateButtonProps {
  postId: string;
}

const { postId } = defineProps<PostUpdateButtonProps>();
</script>

<template>
  <v-btn rd-0="!" icon="mdi-pencil" size="small" @click="navigateTo(RoutePath.PostUpdate(postId))" />
</template>
