<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import { ItemType } from "@/models/clicker/ItemType";
import type { Upgrade } from "@/models/clicker/Upgrade";
import { useGameStore } from "@/store/clicker/game";
import { useUpgradeStore } from "@/store/clicker/upgrade";

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isBuyable?: true;
}

const props = defineProps<UpgradeListItemProps>();
const { upgrade, isBuyable } = toRefs(props);
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useSound(buySfx);
const isAffordable = computed(() => Boolean(game.value && game.value.noPoints >= upgrade.value.price));
</script>

<template>
  <ClickerModelItemMenu
    :type="ItemType.Upgrade"
    :name="upgrade.name"
    :description="upgrade.description"
    :flavor-description="upgrade.flavorDescription"
    :price="upgrade.price"
    :is-affordable="isAffordable"
  >
    <template v-if="isBuyable" #action>
      <v-spacer />
      <StyledButton
        :disabled="!isAffordable"
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
