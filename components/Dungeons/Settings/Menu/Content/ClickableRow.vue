<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import { Input } from "phaser";

interface ContentTextProps {
  rowIndex: number;
}

const { rowIndex } = defineProps<ContentTextProps>();
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
const onGridClick = useOnGridClick(
  optionGrid,
  () => ({ x: 0, y: rowIndex }),
  () => {
    if (optionGrid.value.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
  },
);
const dimensions = useSettingsCursorDimensions(() => rowIndex);
</script>

<template>
  <Rectangle :configuration="dimensions" @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick" />
</template>
