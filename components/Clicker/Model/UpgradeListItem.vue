<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Upgrade } from "@/models/clicker";
import { useGameStore } from "@/store/clicker/useGameStore";
import { useUpgradeStore } from "@/store/clicker/useUpgradeStore";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { storeToRefs } from "pinia";
import { VMenu } from "vuetify/components";

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isBought?: boolean;
}

const props = defineProps<UpgradeListItemProps>();
const { upgrade, isBought } = $(toRefs(props));
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const upgradeStore = useUpgradeStore();
const { createBoughtUpgrade } = upgradeStore;
const { play } = useSound(buySfx);
let menu = $ref(false);
const cardRef = ref<HTMLDivElement>();
const sanitizedUpgradeDescription = $computed(() => DOMPurify.sanitize(marked.parse(upgrade.description)));
const isBuyable = $computed(() => Boolean(game && game.noPoints >= upgrade.price));

onClickOutside(cardRef, () => {
  if (menu) menu = false;
});
</script>

<template>
  <v-menu v-model="menu" location="right center" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-list-item :title="upgrade.name" :="menuProps" />
    </template>
    <v-card ref="cardRef">
      <v-card-title class="text-subtitle-1" display="flex!" font="bold!">
        {{ upgrade.name }}
      </v-card-title>
      <v-card-text>
        <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
        <div v-html="sanitizedUpgradeDescription" />
        <div pt="4" display="flex" justify="end" font="italic">"{{ upgrade.flavorDescription }}"</div>
        <div pt="4" display="flex">
          <v-spacer />
          {{ upgrade.price }} <ClickerPinaColada width="24" height="24" />
        </div>
      </v-card-text>
      <template v-if="!isBought">
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <StyledButton
            :button-props="{ disabled: !isBuyable }"
            @click="
              () => {
                createBoughtUpgrade(upgrade);
                play();
                menu = false;
              }
            "
          >
            Buy
          </StyledButton>
        </v-card-actions>
      </template>
    </v-card>
  </v-menu>
</template>

<!-- @NOTE: Seems like reactivity transform doesn't work with v-bind -->
<!-- This might be fixed in Vue 3.3 -->
<!-- <style scoped lang="scss">
.not-buyable {
  color: v-bind(error);
}
</style> -->
