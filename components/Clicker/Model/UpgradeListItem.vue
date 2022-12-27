<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Upgrade } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { useUpgradeStore } from "@/store/clicker/useUpgradeStore";
import { storeToRefs } from "pinia";

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isBuyable?: true;
}

const props = defineProps<UpgradeListItemProps>();
const { upgrade, isBuyable } = $(toRefs(props));
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useSound(buySfx);
const isAffordable = $computed(() => Boolean(game && game.noPoints >= upgrade.price));
</script>

<template>
  <ClickerModelItemMenu
    :name="upgrade.name"
    :description="upgrade.description"
    :flavor-description="upgrade.flavorDescription"
    :price="upgrade.price"
    :is-affordable="isAffordable"
    :is-buyable="isBuyable"
    @buy="
      () => {
        createBoughtUpgrade(upgrade);
        play();
      }
    "
  />
</template>
