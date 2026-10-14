<script setup lang="ts">
import { Input } from "phaser";
import { Rectangle } from "vue-phaserjs";

interface Props {
  rowIndex: number;
}

const { rowIndex } = defineProps<Props>();
const onGridClick = useSettingsOnGridClick(() => ({ x: 0, y: rowIndex }));
const { width, y, ...configuration } = useSettingsCursorDimensions(() => rowIndex);
</script>

<template>
  <Rectangle
    :configuration="{ y, width, ...configuration }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick()"
  />
</template>
