<script setup lang="ts">
interface Props {
  text: string;
}

const { text } = defineProps<Props>();
</script>

<template>
  <v-tooltip>
    <template #activator="{ props }">
      <v-icon :="props">mdi-help-circle</v-icon>
    </template>
    {{ text }}
  </v-tooltip>
</template>
