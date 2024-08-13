<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { useInputStore } from "@/lib/phaser/store/input";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import { Input } from "phaser";

interface ContentTextProps {
  rowIndex: number;
}

const { rowIndex } = defineProps<ContentTextProps>();
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
const onGridClick = useOnGridClick(
  optionGrid,
  () => ({ x: 0, y: rowIndex }),
  () => {
    if (optionGrid.value.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
  },
);
const { width, y, ...configuration } = useSettingsCursorDimensions(() => rowIndex);
</script>

<template>
  <Rectangle :configuration="{ y, width, ...configuration }" @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick" />
</template>
