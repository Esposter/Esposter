<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { Sound } from "@/models/clicker/Sound";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { INVENTORY_ITEM_POSITION_AREA, STORE_ITEM_POSITION_AREA } from "@/services/clicker/constants";
import { useClickerStore } from "@/store/clicker";
import { useUpgradeStore } from "@/store/clicker/upgrade";

interface Props {
  isBought?: true;
  upgrade: Upgrade;
}

const { isBought, upgrade } = defineProps<Props>();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useClickerSound(Sound.Buy);
const isAffordable = computed(() => clicker.value.pointCount >= upgrade.price);
const displayDescription = useDecompileString(upgrade.description);
const displayFlavorDescription = useDecompileString(upgrade.flavorDescription);
</script>

<template>
  <ClickerModelItemMenu
    :id="upgrade.id"
    :type="ItemType.Upgrade"
    :is-affordable
    :position-area="isBought ? INVENTORY_ITEM_POSITION_AREA : STORE_ITEM_POSITION_AREA"
    :description="displayDescription"
    :flavor-description="displayFlavorDescription"
    :price="upgrade.price"
  >
    <template v-if="!isBought" #action>
      <UiButton
        :disabled="!isAffordable"
        :variant="UiButtonVariant.Accent"
        @click="
          () => {
            createBoughtUpgrade(upgrade);
            play();
          }
        "
      >
        Buy
      </UiButton>
    </template>
  </ClickerModelItemMenu>
</template>
