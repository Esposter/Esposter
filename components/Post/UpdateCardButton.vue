<script setup lang="ts">
import { POST_UPDATE_PATH } from "@/util/constants.client";

interface UpdateCardButtonProps {
  postId: string;
}

const props = defineProps<UpdateCardButtonProps>();
const { postId } = $(toRefs(props));
const onUpdatePost = async () => await navigateTo(POST_UPDATE_PATH(postId));
</script>

<template>
  <v-btn rd="0!" icon="mdi-pencil" size="small" @click="onUpdatePost" />
</template>
