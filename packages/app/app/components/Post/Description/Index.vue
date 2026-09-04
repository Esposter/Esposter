<script setup lang="ts">
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";

interface Props {
  description: string;
}

const { description } = defineProps<Props>();
</script>

<template>
  <v-card-text v-if="!EMPTY_TEXT_REGEX.test(description)" px-0 pb-0 text-body-large>
    <div class="rich-text-content" v-html="description" />
  </v-card-text>
</template>
