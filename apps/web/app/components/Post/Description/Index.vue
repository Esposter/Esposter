<script setup lang="ts">
import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";

interface Props {
  description: string;
}

defineProps<Props>();
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- a post or comment's sanitized HTML, cleaned at its Zod boundary -->
  <div v-if="!EMPTY_TEXT_REGEX.test(description)" class="rich-text-content" v-html="description" />
</template>
