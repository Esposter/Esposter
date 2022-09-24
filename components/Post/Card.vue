<script setup lang="ts">
import { PostWithCreator } from "@/prisma/types";

interface CardProps {
  post: Partial<PostWithCreator>;
}

const props = defineProps<CardProps>();
const post = toRef(props, "post");
</script>

<template>
  <v-card b="1! gray!">
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
