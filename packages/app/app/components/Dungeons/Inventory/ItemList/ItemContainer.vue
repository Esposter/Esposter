<script setup lang="ts">
import type { Item } from "#shared/models/dungeons/item/Item";

import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { CURSOR_POSITION_INCREMENT, INITIAL_CURSOR_POSITION } from "@/services/dungeons/scene/inventory/constants";
import { Container } from "vue-phaserjs";

interface Props {
  columnIndex: number;
  item: Item | PlayerSpecialInput.Cancel;
  rowIndex: number;
}

const { columnIndex, item, rowIndex } = defineProps<Props>();
const itemOptionGrid = useItemOptionGrid();
const onGridClick = useOnGridClick(itemOptionGrid, () => ({ x: columnIndex, y: rowIndex }));
</script>

<template>
  <Container :configuration="{ y: INITIAL_CURSOR_POSITION.y - 16 + CURSOR_POSITION_INCREMENT.y * rowIndex }">
    <DungeonsInventoryItemListRow
      v-if="item === PlayerSpecialInput.Cancel"
      :text="PlayerSpecialInput.Cancel"
      @click="onGridClick"
    />
    <DungeonsInventoryItemListItem v-else :item :row-index :column-index @click="onGridClick" />
  </Container>
</template>
