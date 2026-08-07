<script setup lang="ts">
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface PostDescriptionProps {
  description: string;
}

const { description } = defineProps<PostDescriptionProps>();
const isEmptyDescription = computed(() => EMPTY_TEXT_REGEX.test(description));
</script>

<template>
  <v-card-text v-if="!isEmptyDescription" px-0 pb-0 text-body-large>
    <div class="rich-text-content" v-html="description" />
  </v-card-text>
</template>
