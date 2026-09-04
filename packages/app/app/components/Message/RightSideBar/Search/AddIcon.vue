<script setup lang="ts">
interface Props {
  // `v-hover`'s own slot prop, taken as it comes — every row that renders this icon is inside one, and each
  // Coercing the null itself was the same expression written at five call sites
  isHovering?: boolean | null;
}

// The affordance every search row shares: a plus that only shows itself under the pointer, kept mounted at
// Zero opacity so the row's height never changes as the pointer crosses it
const { isHovering } = defineProps<Props>();
</script>

<template>
  <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
</template>
