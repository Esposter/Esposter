<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { INVENTORY_ITEM_POSITION_AREA, STORE_ITEM_POSITION_AREA } from "@/services/clicker/constants";
import { UpgradeIconMap } from "@/services/clicker/icon/UpgradeIconMap";
import { usePointStore } from "@/store/clicker/point";
import { takeOne } from "@esposter/shared";

interface Props {
  // The inventory's, which has nothing left to pay
  isBought?: true;
  upgrades: Upgrade[];
}

const { isBought, upgrades } = defineProps<Props>();
const pointStore = usePointStore();
const { checkIsAffordable } = pointStore;
const items = computed(() =>
  upgrades.map<ClickerListItem>(({ id, price }) => ({
    id,
    image: UpgradeIconMap[id],
    isAffordable: isBought ? undefined : checkIsAffordable(price),
    price,
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
      <template #detail="{ id }">
        <ClickerModelUpgradeDetail
          :upgrade="
            takeOne(
              upgrades,
              upgrades.findIndex((upgrade) => upgrade.id === id),
            )
          "
          :is-bought
        />
      </template>
    </ClickerModelItemList>
  </ClickerModelListGroup>
</template>
