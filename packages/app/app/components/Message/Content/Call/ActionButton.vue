<script setup lang="ts">
interface CallActionButtonProps {
  color?: string;
  icon: string;
  tooltip: string;
  variant: "plain" | "tonal";
}

const { color, icon, tooltip, variant } = defineProps<CallActionButtonProps>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <v-tooltip :text="tooltip" location="top">
    <template #activator="{ props }">
      <v-btn :="props" :icon :color size="default" :variant :ripple="false" @click="emit('click')" />
    </template>
  </v-tooltip>
</template>
