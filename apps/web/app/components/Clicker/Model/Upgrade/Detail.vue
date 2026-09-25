<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { Sound } from "@/models/clicker/Sound";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { usePointStore } from "@/store/clicker/point";
import { useUpgradeStore } from "@/store/clicker/upgrade";

interface Props {
  isBought?: true;
  upgrade: Upgrade;
}

const { isBought, upgrade } = defineProps<Props>();
const pointStore = usePointStore();
const { checkIsAffordable } = pointStore;
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useClickerSound(Sound.Buy);
const isAffordable = computed(() => checkIsAffordable(upgrade.price));
const displayDescription = useDecompileString(upgrade.description);
const displayFlavorDescription = useDecompileString(upgrade.flavorDescription);
</script>

<template>
  <ClickerModelItemDetail
    :id="upgrade.id"
    :type="ItemType.Upgrade"
    :is-affordable
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
  </ClickerModelItemDetail>
</template>
