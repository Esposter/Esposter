<script setup lang="ts">
import { Sound } from "@/models/clicker/Sound";
import { ItemType } from "@/models/clicker/data/ItemType";
import type { Upgrade } from "@/models/clicker/data/Upgrade";
import { useGameStore } from "@/store/clicker/game";
import { useUpgradeStore } from "@/store/clicker/upgrade";

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isBought?: true;
}

const { upgrade, isBought } = defineProps<UpgradeListItemProps>();
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useClickerSound(Sound.Buy);
const isAffordable = computed(() => Boolean(game.value.noPoints >= upgrade.price));
const displayDescription = useDecompileString(upgrade.description);
const displayFlavorDescription = useDecompileString(upgrade.flavorDescription);
</script>

<template>
  <ClickerModelItemMenu
    :type="ItemType.Upgrade"
    :is-affordable="isAffordable"
    :menu-props="{ location: isBought ? 'left center' : 'right center' }"
    :name="upgrade.name"
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
