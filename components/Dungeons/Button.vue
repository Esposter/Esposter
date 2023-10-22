<script setup lang="ts">
interface DungeonsButtonProps {
  icon: string;
  text: string;
}

const { icon, text } = defineProps<DungeonsButtonProps>();
const emit = defineEmits<{ click: [value: MouseEvent] }>();
</script>

<template>
  <v-btn class="button" variant="outlined" @click="(e: MouseEvent) => emit('click', e)">
    <v-icon :icon="icon" />
    <span class="paragraph" pl-2 text-2xl>{{ text }}</span>
  </v-btn>
</template>

<style scoped lang="scss">
.button {
  width: 11rem;
}
</style>
