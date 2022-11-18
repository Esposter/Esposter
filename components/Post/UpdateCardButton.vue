<script setup lang="ts">
import { INDEX_PATH } from "@/util/constants.client";

const onUpdatePost = async () => {
  await navigateTo(INDEX_PATH);
};
</script>

<template>
  <v-btn icon="mdi-pencil" @click="onUpdatePost" />
</template>
