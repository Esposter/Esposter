<script setup lang="ts">
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface Props {
  description: string;
}

const { description } = defineProps<Props>();
</script>

<template>
  <div v-if="!EMPTY_TEXT_REGEX.test(description)" class="rich-text-content" v-html="description" />
</template>
