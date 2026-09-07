<script setup lang="ts">
import type { GroupProps } from "@/components/Clicker/Svg/GroupProps";

import { useClickerStore } from "@/store/clicker";

const svgGroupProps = defineProps<GroupProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const clickerStore = useClickerStore();
const { clickerItemProperties } = storeToRefs(clickerStore);
</script>

<template>
  <component :is="clickerItemProperties.iconComponent" :="svgGroupProps" @click="emit('click', $event)" />
</template>
