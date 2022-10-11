<script setup lang="ts">
import { PostWithCreator } from "@/prisma/types";

interface CardProps {
  post: PostWithCreator;
}

const props = defineProps<CardProps>();
const post = toRef(props, "post");
const { border, surfaceOpacity80 } = useGlobalTheme().value.colors;
</script>

<template>
  <v-card class="card">
    <PostLikeSection position="absolute" left="2" top="2" :post="post" />
    <v-card p="2!">
      <v-avatar>
        <v-img v-if="post.creator.avatar" :src="post.creator.avatar" />
      </v-avatar>
      Posted by {{ post.creator.username }} {{ post.createdAt }}
      <v-card-title p="x-0!">
        {{ post.title }}
      </v-card-title>
      <v-card-text p="x-0! b-0!">
        {{ post.description }}
      </v-card-text>
    </v-card>
  </v-card>
</template>

<style scoped lang="scss">
.card {
  padding-left: 2.5rem;
  background-color: v-bind(surfaceOpacity80);
  border: 1px solid v-bind(border);
}
</style>
