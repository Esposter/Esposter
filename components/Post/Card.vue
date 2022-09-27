<script setup lang="ts">
import { PostWithCreator } from "@/prisma/types";

interface CardProps {
  post: Partial<PostWithCreator>;
}

const props = defineProps<CardProps>();
const post = toRef(props, "post");
const { border } = useGlobalTheme().value.colors;
</script>

<template>
  <v-card class="border">
    <v-card-title>
      <v-avatar>
        <v-img v-if="post.creator?.avatar" :src="post.creator.avatar" />
      </v-avatar>
      {{ post.title }}
    </v-card-title>
    <v-card-text>
      {{ post.description }}
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.border {
  border: 1px solid v-bind(border);
}
</style>
