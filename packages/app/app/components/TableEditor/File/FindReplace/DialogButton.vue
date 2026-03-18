<script setup lang="ts">
const { isOpen } = useFindReplaceState();
</script>

<template>
  <v-tooltip text="Find & Replace">
    <template #activator="{ props }">
      <v-btn m-0 icon="mdi-magnify" size="small" tile :="props" @click.stop="isOpen = !isOpen" />
    </template>
  </v-tooltip>
</template>
