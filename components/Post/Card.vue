<script setup lang="ts">
import type { PostWithRelations } from "@/prisma/types";

interface CardProps {
  post: PostWithRelations;
}

const props = defineProps<CardProps>();
const post = toRef(props, "post");
const { surfaceOpacity80 } = useColors();
</script>

<template>
  <StyledCard class="card">
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
  </StyledCard>
</template>

<style scoped lang="scss">
.card {
  padding-left: 2.5rem;
  background-color: v-bind(surfaceOpacity80);
}
</style>
