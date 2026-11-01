<script setup lang="ts">
interface Props {
  // The share of the member's Max HP it holds, shown as a percentage
  healthShare: number;
  // The member's name in the reader's language
  name: string;
}

const { healthShare, name } = defineProps<Props>();
const emit = defineEmits<{ heal: [] }>();
</script>

<template>
  <button type="button" @click="emit('heal')">
    <span class="name">{{ name }}</span>
    <span class="health">{{ Math.round(healthShare * 100) }}%</span>
  </button>
</template>
