<script setup lang="ts">
import type { Item } from "#shared/models/dungeons/item/Item";

import { MenuTextStyle } from "@/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/scene/inventory/constants";
import { DISABLED_OPACITY } from "@/services/vuetify/constants";
import { prettify } from "@/util/text/prettify";
import { Container, Text } from "vue-phaserjs";

interface Props {
  columnIndex: number;
  item: Item;
  rowIndex: number;
}

const { columnIndex, item, rowIndex } = defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
const itemOptionGrid = useItemOptionGrid();
const isUsableItem = useIsUsableItem(() => item);
const text = computed(() => prettify(item.id));
const alpha = computed(() => {
  const isValid = unref(itemOptionGrid.validate({ x: columnIndex, y: rowIndex }));
  return isValid ? 1 : DISABLED_OPACITY;
});
</script>

<template>
  <Container :configuration="{ alpha }">
    <DungeonsInventoryItemListRow :text @click="isUsableItem && emit('click')">
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
    </DungeonsInventoryItemListRow>
  </Container>
</template>
