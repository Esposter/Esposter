<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/inventory/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Item } from "@/models/dungeons/item/Item";
import { CURSOR_POSITION_INCREMENT, INITIAL_CURSOR_POSITION } from "@/services/dungeons/inventory/constants";

interface InventoryItemListItemProps {
  rowIndex: number;
  item: Item | PlayerSpecialInput.Cancel;
}

const { rowIndex, item } = defineProps<InventoryItemListItemProps>();
const getY = (rowIndex: number) => INITIAL_CURSOR_POSITION.y - 16 + CURSOR_POSITION_INCREMENT.y * rowIndex;
</script>

<template>
  <Text
    v-if="item === PlayerSpecialInput.Cancel"
    :configuration="{
      x: INITIAL_CURSOR_POSITION.x + 20,
      y: getY(rowIndex),
      text: PlayerSpecialInput.Cancel,
      style: MenuTextStyle,
    }"
  />
  <template v-else>
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 20,
        y: getY(rowIndex),
        text: item.name,
        style: MenuTextStyle,
      }"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 590,
        y: getY(rowIndex) + 3,
        text: 'x',
        style: { ...MenuTextStyle, fontFamily: 'Courier' },
      }"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 620,
        y: getY(rowIndex),
        text: `${item.quantity}`,
        style: MenuTextStyle,
      }"
    />
  </template>
</template>
