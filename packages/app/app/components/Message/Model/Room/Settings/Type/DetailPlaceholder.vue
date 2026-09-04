<script setup lang="ts">
interface Props {
  text: string;
}

const { text } = defineProps<Props>();
</script>

<template>
  <v-col py-12 flex items-center justify-center op-medium-emphasis>{{ text }}</v-col>
</template>
