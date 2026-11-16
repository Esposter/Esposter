<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ClickerUpgradeListItem } from "#src/models/clicker/ClickerUpgradeListItem";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { INVENTORY_ITEM_POSITION_AREA, STORE_ITEM_POSITION_AREA } from "#src/services/clicker/constants";
import { UpgradeIconMap } from "#src/services/clicker/icon/UpgradeIconMap";
import { usePointStore } from "#src/store/clicker/point";

interface Props {
  // The inventory's, which has nothing left to pay
  isBought?: true | undefined;
  upgrades: Upgrade[];
}

const { isBought, upgrades } = defineProps<Props>();
const pointStore = usePointStore();
const { checkIsAffordable } = pointStore;
const items = computed(() =>
  upgrades.map<ClickerUpgradeListItem>((upgrade) => ({
    id: upgrade.id,
    image: UpgradeIconMap[upgrade.id],
    isAffordable: isBought ? undefined : checkIsAffordable(upgrade.price),
    price: upgrade.price,
    upgrade,
  })),
);
</script>

<template>
  <ClickerModelListGroup
    v-if="upgrades.length > 0"
    :count="upgrades.length"
    :meaning="UiIconMeaning.Upgrade"
    title="Upgrades"
  >
    <ClickerModelItemList
      :items
      label="Upgrades"
      :position-area="isBought ? INVENTORY_ITEM_POSITION_AREA : STORE_ITEM_POSITION_AREA"
    >
      <template #detail="{ item }">
        <ClickerModelUpgradeDetail :upgrade="item.upgrade" :is-bought />
      </template>
    </ClickerModelItemList>
  </ClickerModelListGroup>
</template>
