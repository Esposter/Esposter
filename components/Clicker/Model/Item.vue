<script setup lang="ts">
import { type SVGAttributes } from "vue";

interface ClickerModelItemProps {
  gAttrs?: SVGAttributes;
}

const { gAttrs } = defineProps<ClickerModelItemProps>();
const emit = defineEmits<{ click: [value: MouseEvent] }>();
const clickerItemProperties = useClickerItemProperties();
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <g :="gAttrs" @click="(e) => emit('click', e)">
      <component :is="clickerItemProperties.iconComponent" />
    </g>
  </svg>
</template>
