<script setup lang="ts">
import { RoutePath } from "@/models/router/RoutePath";

interface PostUpdateButtonProps {
  postId: string;
}

const props = defineProps<PostUpdateButtonProps>();
const { postId } = toRefs(props);
</script>

<template>
  <v-btn rd="0!" icon="mdi-pencil" size="small" @click="navigateTo(RoutePath.PostUpdate(postId))" />
</template>
