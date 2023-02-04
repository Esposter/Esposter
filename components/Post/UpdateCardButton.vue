<script setup lang="ts">
interface UpdateCardButtonProps {
  postId: string;
}

const props = defineProps<UpdateCardButtonProps>();
const { postId } = $(toRefs(props));
const onUpdatePost = () => navigateTo(POST_UPDATE_PATH(postId));
</script>

<template>
  <v-btn rd="0!" icon="mdi-pencil" size="small" @click="onUpdatePost" />
</template>
