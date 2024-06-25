<script setup lang="ts">
import { Sound } from "@/models/clicker/Sound";
import { ItemType } from "@/models/clicker/data/ItemType";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";
import { useClickerStore } from "@/store/clicker";
import { useUpgradeStore } from "@/store/clicker/upgrade";

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isBought?: true;
}

const { upgrade, isBought } = defineProps<UpgradeListItemProps>();
const clickerStore = useClickerStore();
const { game } = storeToRefs(clickerStore);
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useClickerSound(Sound.Buy);
const isAffordable = computed(() => Boolean(game.value.noPoints >= upgrade.price));
const displayDescription = useDecompileString(upgrade.description);
const displayFlavorDescription = useDecompileString(upgrade.flavorDescription);
</script>

<template>
  <ClickerModelItemMenu
    :id="upgrade.id"
    :type="ItemType.Upgrade"
    :is-affordable="isAffordable"
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
