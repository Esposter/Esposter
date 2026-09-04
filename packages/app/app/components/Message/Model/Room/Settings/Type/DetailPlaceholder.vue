<script setup lang="ts">
interface DetailPlaceholderProps {
  text: string;
}

const { text } = defineProps<DetailPlaceholderProps>();
</script>

<template>
  <v-col py-12 flex items-center justify-center op-medium-emphasis>{{ text }}</v-col>
</template>
