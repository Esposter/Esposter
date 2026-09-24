<script setup lang="ts">
interface Props {
  // `v-hover`'s own slot prop, taken as it comes, since every row that renders this icon is inside one
  isHovering?: boolean | null;
}

// The affordance every search row shares: a plus that only shows itself under the pointer, kept mounted at
// Zero opacity so the row's height never changes as the pointer crosses it
const { isHovering } = defineProps<Props>();
</script>

<template>
  <v-icon :op="isHovering ? undefined : '0!'" icon="i-mdi:plus" />
</template>
