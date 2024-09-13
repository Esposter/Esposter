<script setup lang="ts">
import type { Item } from "@/models/dungeons/item/Item";

import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { CONTENT_MENU_WIDTH, INITIAL_CURSOR_POSITION } from "@/services/dungeons/scene/inventory/constants";
import { DISABLED_OPACITY } from "@/services/vuetify/constants";
import { prettifyName } from "@/util/text/prettifyName";
import { Input } from "phaser";
import { Container, Rectangle, Text } from "vue-phaser";

interface ItemProps {
  columnIndex: number;
  item: Item;
  rowIndex: number;
}

const { columnIndex, item, rowIndex } = defineProps<ItemProps>();
const emit = defineEmits<{ click: [] }>();
const itemOptionGrid = useItemOptionGrid();
const isUsableItem = useIsUsableItem(() => item);
const alpha = computed(() => {
  const isValid = unref(itemOptionGrid.validate({ x: columnIndex, y: rowIndex }));
  return isValid ? 1 : DISABLED_OPACITY;
});
</script>

<template>
  <Container :configuration="{ alpha }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: CONTENT_MENU_WIDTH,
        height: MenuTextStyle.fontSize,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="isUsableItem && emit('click')"
    />
    <DungeonsText      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 20,
        text: prettifyName(item.id),
        style: MenuTextStyle,
      }"
    />
    <DungeonsText      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 590,
        y: 3,
        text: 'x',
        style: { ...MenuTextStyle, fontFamily: 'Courier' },
      }"
    />
    <DungeonsText      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 620,
        text: `${item.quantity}`,
        style: MenuTextStyle,
      }"
    />
  </Container>
</template>
