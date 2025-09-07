<script setup lang="ts">
import type { Item } from "#shared/models/dungeons/item/Item";

import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { CONTENT_MENU_WIDTH, INITIAL_CURSOR_POSITION } from "@/services/dungeons/scene/inventory/constants";
import { DISABLED_OPACITY } from "@/services/vuetify/constants";
import { prettify } from "@/util/text/prettify";
import { Input } from "phaser";
import { Container, Rectangle, Text } from "vue-phaserjs";

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
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 20,
        text: prettify(item.id),
        style: MenuTextStyle,
      }"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 590,
        y: 3,
        text: 'x',
        style: { ...MenuTextStyle, fontFamily: 'Courier' },
      }"
    />
    <Text
      :configuration="{
        x: INITIAL_CURSOR_POSITION.x + 620,
        text: `${item.quantity}`,
        style: MenuTextStyle,
      }"
    />
  </Container>
</template>
