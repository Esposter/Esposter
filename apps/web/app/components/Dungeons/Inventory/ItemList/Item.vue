<script setup lang="ts">
import type { Item } from "#shared/models/dungeons/item/Item";

import { MenuTextStyle } from "#src/assets/dungeons/scene/inventory/styles/MenuTextStyle";
import { checkIsUsableItem } from "#src/services/dungeons/scene/inventory/checkIsUsableItem";
import { INITIAL_CURSOR_POSITION } from "#src/services/dungeons/scene/inventory/constants";
import { DISABLED_OPACITY } from "#src/services/ui/constants";
import { useInventorySceneStore } from "#src/store/dungeons/inventory/scene";
import { useSceneStore } from "#src/store/dungeons/scene";
import { prettify } from "#src/util/text/prettify";
import { Container, Text } from "vue-phaserjs";

interface Props {
  columnIndex: number;
  item: Item;
  rowIndex: number;
}

const { item } = defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
const inventorySceneStore = useInventorySceneStore();
const { itemOptionGrid } = inventorySceneStore;
const sceneStore = useSceneStore();
const { previousSceneKey } = storeToRefs(sceneStore);
const isUsableItem = computed(() => checkIsUsableItem(item, previousSceneKey.value));
const text = computed(() => prettify(item.id));
</script>

<template>
  <Container
    :configuration="{ alpha: unref(itemOptionGrid.validate({ x: columnIndex, y: rowIndex })) ? 1 : DISABLED_OPACITY }"
  >
    <DungeonsInventoryItemListRow :text @click="isUsableItem && emit('click')">
      <Text
        :configuration="{
          x: INITIAL_CURSOR_POSITION.x + 590,
          y: 3,
          text: 'x',
          style: { ...MenuTextStyle, fontFamily: 'Courier' },
        }"
      />
      <Text :configuration="{ x: INITIAL_CURSOR_POSITION.x + 620, text: `${item.quantity}`, style: MenuTextStyle }" />
    </DungeonsInventoryItemListRow>
  </Container>
</template>
