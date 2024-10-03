<script setup lang="ts">
import type { ClickerSvgGroupProps } from "@/components/Clicker/Svg/Group.vue";

const svgGroupProps = defineProps<ClickerSvgGroupProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const clickerItemProperties = useClickerItemProperties();
</script>

<template>
  <component :is="clickerItemProperties.iconComponent" :="svgGroupProps" @click="emit('click', $event)" />
</template>
