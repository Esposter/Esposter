<script setup lang="ts">
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { Sound } from "@/models/clicker/Sound";
import { useClickerStore } from "@/store/clicker";
import { useUpgradeStore } from "@/store/clicker/upgrade";

interface UpgradeListItemProps {
  isBought?: boolean;
  upgrade: Upgrade;
}

const { isBought = false, upgrade } = defineProps<UpgradeListItemProps>();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useClickerSound(Sound.Buy);
const isAffordable = computed(() => clicker.value.noPoints >= upgrade.price);
const displayDescription = useDecompileString(upgrade.description);
const displayFlavorDescription = useDecompileString(upgrade.flavorDescription);
</script>

<template>
  <ClickerModelItemMenu
    :id="upgrade.id"
    :type="ItemType.Upgrade"
    :is-affordable
    :menu-props="{ location: isBought ? 'left center' : 'right center' }"
    :description="displayDescription"
    :flavor-description="displayFlavorDescription"
    :price="upgrade.price"
  >
    <template v-if="!isBought" #action>
      <v-spacer />
      <StyledButton
        :button-props="{
          disabled: !isAffordable,
        }"
        @click="
          () => {
            createBoughtUpgrade(upgrade);
            play();
          }
        "
      >
        Buy
      </StyledButton>
    </template>
  </ClickerModelItemMenu>
</template>
