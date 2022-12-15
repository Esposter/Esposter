<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Building } from "@/models/clicker";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { filename } from "pathe/utils";
import { storeToRefs } from "pinia";
import { VMenu } from "vuetify/components";

interface BuildingListItemProps {
  building: Building;
}

const props = defineProps<BuildingListItemProps>();
const { building } = $(toRefs(props));
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const buildingStore = useBuildingStore();
const { createBoughtBuilding, getBuildingPrice, getBoughtBuildingLevel } = buildingStore;
const { play } = useSound(buySfx);
let menu = $ref(false);
const cardRef = ref<HTMLDivElement>();
const boughtBuildingLevel = $computed(() => getBoughtBuildingLevel(building));
const buildingPrice = $computed(() => getBuildingPrice(building));
const isBuyable = $computed(() => Boolean(game && game.noPoints >= buildingPrice));

onClickOutside(cardRef, () => {
  if (menu) menu = false;
});

// @NOTE: Hacky way to do dynamic image paths with nuxt 3 for now
// https://github.com/nuxt/framework/issues/7121
const glob = import.meta.glob("@/assets/clicker/icons/*.png", { eager: true, import: "default" });
const images = Object.fromEntries(
  Object.entries(glob).map(([key, value]) => [filename(key), value as unknown as string])
);
const buildingIcon = $computed(() => images[building.name]);
</script>

<template>
  <v-menu v-model="menu" location="right center" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-list-item :="menuProps">
        <template #prepend>
          <img :src="buildingIcon" :alt="building.name" />
        </template>
        <template #title>
          <span select="none">
            {{ building.name }}
          </span>
        </template>
        <template #append>
          <span font="bold" select="none">
            {{ boughtBuildingLevel }}
          </span>
        </template>
      </v-list-item>
    </template>
    <v-card ref="cardRef">
      <v-card-title class="text-subtitle-1" display="flex!" font="bold!">
        <img :src="buildingIcon" :alt="building.name" />
        {{ building.name }}
      </v-card-title>
      <v-card-text>
        <div display="flex" justify="end" font="italic">"{{ building.flavorDescription }}"</div>
        <div pt="4" display="flex">
          <v-spacer />
          {{ buildingPrice }} <ClickerModelPinaColada width="24" height="24" />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <StyledButton
          :button-props="{ disabled: !isBuyable }"
          @click="
            () => {
              createBoughtBuilding(building);
              play();
            }
          "
        >
          Buy
        </StyledButton>
      </v-card-actions>
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
