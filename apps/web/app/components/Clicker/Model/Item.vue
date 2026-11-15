<script setup lang="ts">
import type { GroupProps } from "#src/components/Clicker/Svg/GroupProps";

import { useClickerStore } from "#src/store/clicker/index";

const svgGroupProps = defineProps<GroupProps>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
const clickerStore = useClickerStore();
const { clickerItemProperties } = storeToRefs(clickerStore);
</script>

<template>
  <component :is="clickerItemProperties.iconComponent" :="svgGroupProps" @click="emit('click', $event)" />
</template>
