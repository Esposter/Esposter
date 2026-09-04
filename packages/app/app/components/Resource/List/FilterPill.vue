<script setup lang="ts">
interface Props {
  isClosedOnContentClick?: true;
  isRemovable?: true;
  label: string;
  value: string;
}

const { isClosedOnContentClick, isRemovable, label, value } = defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <v-menu :close-on-content-click="Boolean(isClosedOnContentClick)">
    <template #activator="{ props: menuProps }">
      <v-chip :closable="isRemovable" :="menuProps" @click:close="emit('remove')">{{ label }} == {{ value }}</v-chip>
    </template>
    <slot />
  </v-menu>
</template>
