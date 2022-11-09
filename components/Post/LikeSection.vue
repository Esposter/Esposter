<script setup lang="ts">
import { Post } from "@prisma/client";

interface LikeSectionProps {
  post: Post;
}

const props = defineProps<LikeSectionProps>();
const { post } = toRefs(props);
</script>

<template>
  <div display="flex" flex="col" items="center">
    <v-btn w="6!" h="6!" bg="transparent!" rd="1!" variant="flat" icon="mdi-arrow-up-bold-outline" />
    {{ post.noPoints }}
    <v-btn w="6!" h="6!" bg="transparent!" rd="1!" variant="flat" icon="mdi-arrow-down-bold-outline" />
  </div>
</template>
