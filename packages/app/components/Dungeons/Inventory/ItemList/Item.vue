<script setup lang="ts">
import type { Item } from "@/models/dungeons/item/Item";

import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import {
  CONTENT_MENU_WIDTH,
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
} from "@/services/dungeons/scene/inventory/constants";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { parsePixel } from "@/util/parsePixel";
import { Input } from "phaser";

interface InventoryItemListItemProps {
  columnIndex: number;
  item: Item | PlayerSpecialInput.Cancel;
  rowIndex: number;
}

const { columnIndex, item, rowIndex } = defineProps<InventoryItemListItemProps>();
const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = storeToRefs(inventorySceneStore);
const onGridClick = useOnGridClick(itemOptionGrid, () => ({ x: columnIndex, y: rowIndex }));
const y = computed(() => INITIAL_CURSOR_POSITION.y - 16 + CURSOR_POSITION_INCREMENT.y * rowIndex);
</script>

<template>
  <template v-if="item === PlayerSpecialInput.Cancel">
    <Rectangle
      :configuration="{
        y,
        origin: 0,
        width: CONTENT_MENU_WIDTH,
        height: parsePixel(MenuTextStyle.fontSize ?? 0),
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 20,
        y,
        text: PlayerSpecialInput.Cancel,
        style: MenuTextStyle,
      }"
    />
  </template>
  <template v-else>
    <Rectangle
      :configuration="{
        y,
        origin: 0,
        width: CONTENT_MENU_WIDTH,
        height: parsePixel(MenuTextStyle.fontSize ?? 0),
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 20,
        y,
        text: item.id,
        style: MenuTextStyle,
      }"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 590,
        y: y + 3,
        text: 'x',
        style: { ...MenuTextStyle, fontFamily: 'Courier' },
      }"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 620,
        y,
        text: `${item.quantity}`,
        style: MenuTextStyle,
      }"
    />
  </template>
</template>
