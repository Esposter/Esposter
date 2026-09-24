<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { INVENTORY_ITEM_POSITION_AREA, STORE_ITEM_POSITION_AREA } from "@/services/clicker/constants";
import { UpgradeIconMap } from "@/services/clicker/icon/UpgradeIconMap";
import { useClickerStore } from "@/store/clicker";
import { takeOne } from "@esposter/shared";

interface Props {
  // The inventory's, which has nothing left to pay
  isBought?: true;
  upgrades: Upgrade[];
}

const { isBought, upgrades } = defineProps<Props>();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const items = computed(() =>
  upgrades.map<ClickerListItem>(({ id, price }) => ({
    id,
    image: UpgradeIconMap[id],
    isAffordable: isBought ? undefined : clicker.value.pointCount >= price,
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
      #detail="{ id }"
      :items
      label="Upgrades"
      :position-area="isBought ? INVENTORY_ITEM_POSITION_AREA : STORE_ITEM_POSITION_AREA"
    >
      <ClickerModelUpgradeDetail
        :upgrade="
          takeOne(
            upgrades,
            upgrades.findIndex((upgrade) => upgrade.id === id),
          )
        "
        :is-bought
      />
    </ClickerModelItemList>
  </ClickerModelListGroup>
</template>
