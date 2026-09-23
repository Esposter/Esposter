<script setup lang="ts">
interface Props {
  text: string;
}

const { text } = defineProps<Props>();
</script>

<template>
  <v-tooltip>
    <template #activator="{ props }">
      <v-icon :="props" icon="i-mdi:help-circle" />
    </template>
    {{ text }}
  </v-tooltip>
</template>
