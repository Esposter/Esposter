<script setup lang="ts">
import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { CookingTalent } from "#src/models/cooking/CookingTalent";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GameText } from "genshin-text";

import { cookRecipeByHand } from "#src/services/cooking/cookRecipeByHand";
import { getCookingPointerPosition } from "#src/services/cooking/getCookingPointerPosition";
import { readCookingZones } from "#src/services/cooking/readCookingZones";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { CookingScreen, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The character on the field, who cooks the dish and whose talent may add to it
  avatarId: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, which each dish is defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items and recipes in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The world's seeded random source, which the dish's quality and the talent's roll draw from
  random: () => number;
  // The recipe cooked by hand, whose zone parameters lay out the indicator
  recipe: CookingRecipe;
  // The cook's talent, if the character has one
  talent?: CookingTalent;
}

const { avatarId, gameText, materialDataMap, nameText, random, recipe, talent } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const inventory = defineModel<Inventory>("inventory", { required: true });
const progress = defineModel<CookingProgress>("progress", { required: true });
const zones = readCookingZones(recipe.qteParam);
// The indicator's pointer swings from the moment the screen opens, and its place at a press is the one shown then
const openedAt = Temporal.Now.instant();
const pointer = ref(0);
let frameId = 0;
const sweep = () => {
  pointer.value = getCookingPointerPosition(Temporal.Now.instant().since(openedAt).total({ unit: "second" }));
  frameId = requestAnimationFrame(sweep);
};
onMounted(() => {
  frameId = requestAnimationFrame(sweep);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
});
// Stop cooks one dish where the pointer stands at the press, spending its ingredients and adding its results to the
// Bag and progress, or nothing where the dish cannot be cooked, and the screen closes either way
const stopCooking = () => {
  const cooked = cookRecipeByHand(recipe, {
    avatarId,
    getDefinition: (itemId) => getItemDefinition(itemId, nameText, materialDataMap),
    inventory: inventory.value,
    progress: progress.value,
    random,
    stopPosition: pointer.value,
    talent,
    zones,
  });
  if (cooked) {
    inventory.value = cooked.inventory;
    progress.value = cooked.progress;
  }
  emit("close");
};
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.CookingTitle]">
    <CookingScreen
      :pointer
      :stop-label="gameText[GameTextKey.CookingStop]"
      :title="gameText[GameTextKey.CookingTitle]"
      :zones
      @close="emit('close')"
      @stop="stopCooking"
    />
  </GameScreen>
</template>
