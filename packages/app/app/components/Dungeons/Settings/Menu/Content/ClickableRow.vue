<script setup lang="ts">
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useControlsStore } from "@/store/dungeons/controls";
import { Input } from "phaser";
import { Rectangle } from "vue-phaserjs";

interface ContentTextProps {
  rowIndex: number;
}

const { rowIndex } = defineProps<ContentTextProps>();
const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
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
