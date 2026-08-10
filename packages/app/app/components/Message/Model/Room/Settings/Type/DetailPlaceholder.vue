<script setup lang="ts">
interface RoomSettingsTypeDetailPlaceholderProps {
  text: string;
}

const { text } = defineProps<RoomSettingsTypeDetailPlaceholderProps>();
</script>

<template>
  <v-col py-12 flex items-center justify-center op-medium-emphasis>{{ text }}</v-col>
</template>
