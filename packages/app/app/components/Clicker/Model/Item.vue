<script setup lang="ts">
import type { ClickerSvgGroupProps } from "@/components/Clicker/Svg/Group.vue";

import { useClickerStore } from "@/store/clicker";

const svgGroupProps = defineProps<ClickerSvgGroupProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const clickerStore = useClickerStore();
const { clickerItemProperties } = storeToRefs(clickerStore);
</script>

<template>
  <component :is="clickerItemProperties.iconComponent" :="svgGroupProps" @click="emit('click', $event)" />
</template>
