<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/inventory/styles/MenuTextStyle";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Item } from "@/models/dungeons/item/Item";
import {
  CONTENT_MENU_WIDTH,
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
} from "@/services/dungeons/inventory/constants";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { Input } from "phaser";

interface InventoryItemListItemProps {
  rowIndex: number;
  columnIndex: number;
  item: Item | PlayerSpecialInput.Cancel;
}

const { rowIndex, columnIndex, item } = defineProps<InventoryItemListItemProps>();
const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = storeToRefs(inventorySceneStore);
const gridPosition = computed(() => ({ x: columnIndex, y: rowIndex }));
const onGridClick = useOnGridClick(itemOptionGrid, gridPosition);
const getY = (rowIndex: number) => INITIAL_CURSOR_POSITION.y - 16 + CURSOR_POSITION_INCREMENT.y * rowIndex;
</script>

<template>
  <template v-if="item === PlayerSpecialInput.Cancel">
    <Rectangle
      :configuration="{
        y: getY(rowIndex),
        origin: 0,
        width: CONTENT_MENU_WIDTH,
        height: MenuTextStyle.fontSize,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 20,
        y: getY(rowIndex),
        text: PlayerSpecialInput.Cancel,
        style: MenuTextStyle,
      }"
    />
  </template>
  <template v-else>
    <Rectangle
      :configuration="{
        y: getY(rowIndex),
        origin: 0,
        width: CONTENT_MENU_WIDTH,
        height: MenuTextStyle.fontSize,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
    />
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
