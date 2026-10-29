<script setup lang="ts">
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import { checkIsOfferableForStrongbox } from "#src/services/crafting/checkIsOfferableForStrongbox";
import { computeMysticOfferingText } from "#src/services/crafting/computeMysticOfferingText";
import { craftStrongbox } from "#src/services/crafting/craftStrongbox";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey, splitGameTextColors } from "genshin-text";
import { computed, ref } from "vue";

interface Props {
  // The tables the strongbox's artifact is rolled from
  artifactDropTables: ArtifactDropTables;
  // The game's words in the reader's language
  gameText: GameText;
  // The bag the offering takes its artifacts from and takes its strongbox's artifact into
  inventory: Inventory;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the strongboxes and items in the reader's language, by their text ids
  names: Readonly<Record<string, string>>;
  // The world's seeded random source, which the strongbox's artifact is rolled from
  random: () => number;
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  // The strongboxes the offering makes, one for each set the player may choose
  strongboxes: CraftingStrongboxData[];
  wallet: Wallet;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: []; craft: [pickUp: DroppedItemPickUp] }>();

const pickedStrongboxId = ref(props.strongboxes[0]?.id ?? 0);
const pickedIds = ref<number[]>([]);
const isConfirming = ref(false);
const pickedStrongbox = computed(() => props.strongboxes.find((strongbox) => strongbox.id === pickedStrongboxId.value));
// The bag's entries the Mystic Offering lists for the picked strongbox, in the bag's order
const candidates = computed(() => {
  const strongbox = pickedStrongbox.value;
  return strongbox === undefined
    ? []
    : props.inventory.items.filter((item) => checkIsOfferableForStrongbox(item, strongbox.rarity));
});
const isReady = computed(
  () => pickedStrongbox.value !== undefined && pickedIds.value.length === pickedStrongbox.value.needCount,
);
// Whether the picks already take the strongbox's count, so an artifact not yet picked is held back from the offering
const isOfferingFull = computed(
  () => pickedStrongbox.value !== undefined && pickedIds.value.length >= pickedStrongbox.value.needCount,
);
// The confirm is the game's own words, in the colours their tags give the counts and the strongbox's name
const confirmSegments = computed(() =>
  splitGameTextColors(
    computeMysticOfferingText(props.gameText[GameTextKey.MysticOfferingConfirm], pickedStrongbox.value, props.names),
  ),
);
</script>

<template>
  <!-- The Mystic Offering at the Crafting Bench: the set a strongbox holds, the bag's unlocked five-star artifacts to give up
       for it, and the confirm before they are given up -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.MysticOffering]">
    <h2>{{ gameText[GameTextKey.MysticOffering] }}</h2>
    <p>
      {{ computeMysticOfferingText(gameText[GameTextKey.MysticOfferingRequirement], pickedStrongbox, names) }}
    </p>
    <ul>
      <li v-for="strongbox in strongboxes" :key="strongbox.id">
        <GameButton
          tip=""
          :kind="GameButtonKind.Row"
          @click="
            () => {
              pickedStrongboxId = strongbox.id;
              pickedIds = [];
              isConfirming = false;
            }
          "
        >
          {{ names[strongbox.nameTextId] ?? "" }}
        </GameButton>
      </li>
    </ul>
    <ul>
      <li v-for="item in candidates" :key="item.id">
        <GameButton
          tip=""
          :kind="GameButtonKind.Row"
          :disabled="isOfferingFull && !pickedIds.includes(item.id)"
          @click="
            pickedIds = pickedIds.includes(item.id)
              ? pickedIds.filter((pickedId) => pickedId !== item.id)
              : [...pickedIds, item.id]
          "
        >
          {{ item.definition.name }}
        </GameButton>
      </li>
    </ul>
    <p v-if="candidates.length === 0">{{ gameText[GameTextKey.MysticOfferingRequiresFiveStar] }}</p>
    <p v-if="!isReady">{{ gameText[GameTextKey.MysticOfferingNotEnough] }}</p>
    <GameButton tip="" :kind="GameButtonKind.Row" :disabled="!isReady" @click="isConfirming = true">
      {{ gameText[GameTextKey.MysticOfferingCreate] }}
    </GameButton>
    <template v-if="isConfirming">
      <p>
        <span v-for="({ color, text }, index) of confirmSegments" :key="index" :style="{ color }">{{ text }}</span>
      </p>
      <GameButton tip="" :kind="GameButtonKind.Row" @click="isConfirming = false">{{
        gameText[GameTextKey.Cancel]
      }}</GameButton>
      <GameButton
        tip=""
        :kind="GameButtonKind.Row"
        @click="
          () => {
            if (pickedStrongbox === undefined) return;
            const pickUp = craftStrongbox(props.inventory, props.wallet, pickedStrongbox, pickedIds, {
              artifactDropTables: props.artifactDropTables,
              materialDataMap: props.materialDataMap,
              names: props.names,
              random: props.random,
              reliquaryPieceEntryMap: props.reliquaryPieceEntryMap,
              weaponDataMap: props.weaponDataMap,
            });
            isConfirming = false;
            if (pickUp === undefined) return;
            pickedIds = [];
            emit('craft', pickUp);
          }
        "
        >{{ gameText[GameTextKey.Confirm] }}</GameButton
      >
    </template>
    <GameButton tip="" :kind="GameButtonKind.Row" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</GameButton>
  </GameScreen>
</template>
