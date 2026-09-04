<script setup lang="ts">
import type { NavigationItem } from "@/models/shared/NavigationItem";

interface Props {
  items: NavigationItem[];
}

const { items } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<!-- The one shape a nav entry takes: the rail, the mobile dropdown and the drawer all render the same row, so
     an item-level change (badge, disabled state, active rule) lands in one place rather than three -->
<template>
  <v-list nav>
    <v-list-item
      v-for="{ icon, isActive, title, to } of items"
      :key="to"
      :active="isActive"
      :prepend-icon="icon"
      :title
      :to
      @click="emit('select')"
    />
  </v-list>
</template>
