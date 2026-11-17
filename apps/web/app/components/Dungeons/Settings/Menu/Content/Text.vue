<script setup lang="ts">
import { MenuTextStyle } from "#src/assets/dungeons/scene/settings/styles/MenuTextStyle";
import { checkIsSettingsOptionWithValue } from "#src/services/dungeons/scene/settings/checkIsSettingsOptionWithValue";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  SETTINGS_VALUE_POSITION_INCREMENT,
} from "#src/services/dungeons/scene/settings/constants";
import { getSettingsOption } from "#src/services/dungeons/scene/settings/getSettingsOption";
import { getSettingsRowY } from "#src/services/dungeons/scene/settings/getSettingsRowY";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { Input } from "phaser";
import { Text } from "vue-phaserjs";

interface Props {
  columnIndex: number;
  rowIndex: number;
  text: string;
}

const { columnIndex, rowIndex, text } = defineProps<Props>();
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const onGridClick = useSettingsOnGridClick(() => ({ x: columnIndex, y: rowIndex }));
// The cell showing the value saved for its row's option is the selected one. An option without a saved value of its own
// (Close) selects nothing
const isSavedValue = computed(() => {
  const settingsOption = getSettingsOption(rowIndex);
  return checkIsSettingsOptionWithValue(settingsOption) && settings.value[settingsOption] === text;
});
</script>

<template>
  <Text
    :configuration="{
      x:
        columnIndex === 0
          ? INITIAL_SETTINGS_POSITION.x
          : INITIAL_SETTINGS_VALUE_POSITION.x + SETTINGS_VALUE_POSITION_INCREMENT.x * (columnIndex - 1),
      y: getSettingsRowY(rowIndex),
      text,
      style: { ...MenuTextStyle, color: isSavedValue ? '#ff2222' : 'white' },
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick()"
  />
</template>
