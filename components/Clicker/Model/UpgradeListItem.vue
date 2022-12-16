<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Upgrade } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { useUpgradeStore } from "@/store/clicker/useUpgradeStore";
import DOMPurify from "dompurify";
import { marked } from "marked";
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
let menu = $ref(false);
const cardRef = ref<HTMLDivElement>();
const sanitizedUpgradeDescription = $computed(() => DOMPurify.sanitize(marked.parse(upgrade.description)));
const isAffordable = $computed(() => Boolean(game && game.noPoints >= upgrade.price));

onClickOutside(cardRef, () => {
  if (menu) menu = false;
});
</script>

<template>
  <ClickerModelItemMenu
    :name="upgrade.name"
    :description="sanitizedUpgradeDescription"
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

<!-- @NOTE: Seems like reactivity transform doesn't work with v-bind -->
<!-- This might be fixed in Vue 3.3 -->
<!-- <style scoped lang="scss">
.not-affordable {
  color: v-bind(error);
}
</style> -->
