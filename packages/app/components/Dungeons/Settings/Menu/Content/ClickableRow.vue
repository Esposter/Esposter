<script setup lang="ts">
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { Input } from "phaser";
import Rectangle, { useInputStore } from "vue-phaser";

interface ContentTextProps {
  rowIndex: number;
}

const { rowIndex } = defineProps<ContentTextProps>();
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const onGridClick = useOnGridClick(
  SettingsOptionGrid,
  () => ({ x: 0, y: rowIndex }),
  () => {
    if (SettingsOptionGrid.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
  },
);
const { width, y, ...configuration } = useSettingsCursorDimensions(() => rowIndex);
</script>

<template>
  <Rectangle :configuration="{ y, width, ...configuration }" @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick" />
</template>
