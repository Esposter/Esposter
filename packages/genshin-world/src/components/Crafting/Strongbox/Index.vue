<script setup lang="ts">
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CraftingStrongbox } from "#src/models/crafting/CraftingStrongbox";
import type { DroppedItemPickUp } from "#src/models/interaction/DroppedItemPickUp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import { craftStrongbox } from "#src/services/crafting/craftStrongbox";
import { getStrongboxCandidates } from "#src/services/crafting/getStrongboxCandidates";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";
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
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>;
  // The strongboxes the offering makes, one for each set the player may choose
  strongboxes: CraftingStrongbox[];
  wallet: Wallet;
  weaponDataMap: ReadonlyMap<number, WeaponData>;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: []; craft: [pickUp: DroppedItemPickUp] }>();

const pickedStrongboxId = ref(props.strongboxes[0]?.id ?? 0);
const pickedIds = ref<number[]>([]);
const isConfirming = ref(false);
const pickedStrongbox = computed(() => props.strongboxes.find((strongbox) => strongbox.id === pickedStrongboxId.value));
const candidates = computed(() =>
  pickedStrongbox.value === undefined
    ? []
    : getStrongboxCandidates(props.inventory.items, pickedStrongbox.value.rarity),
);
const isReady = computed(
  () => pickedStrongbox.value !== undefined && pickedIds.value.length === pickedStrongbox.value.needCount,
);

const pickStrongbox = (id: number) => {
  pickedStrongboxId.value = id;
  pickedIds.value = [];
  isConfirming.value = false;
};
const togglePick = (id: number) => {
  pickedIds.value = pickedIds.value.includes(id)
    ? pickedIds.value.filter((pickedId) => pickedId !== id)
    : [...pickedIds.value, id];
};
const create = () => {
  if (pickedStrongbox.value === undefined) return;
  const pickUp = craftStrongbox(props.inventory, props.wallet, pickedStrongbox.value, pickedIds.value, {
    artifactDropTables: props.artifactDropTables,
    materialDataMap: props.materialDataMap,
    names: props.names,
    random: Math.random,
    reliquaryPieceEntryMap: props.reliquaryPieceEntryMap,
    weaponDataMap: props.weaponDataMap,
  });
  isConfirming.value = false;
  if (pickUp === undefined) return;
  pickedIds.value = [];
  emit("craft", pickUp);
};
</script>

<template>
  <!-- The Mystic Offering at the Crafting Bench: the set a strongbox holds, the bag's unlocked five-star artifacts to give up
       for it, and the confirm before they are given up -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.MysticOffering]">
    <h2>{{ gameText[GameTextKey.MysticOffering] }}</h2>
    <p>
      {{
        fillGameTextValues(
          gameText[GameTextKey.MysticOfferingRequirement],
          pickedStrongbox?.needCount ?? 0,
          pickedStrongbox?.rarity ?? 0,
        )
      }}
    </p>
    <ul>
      <li v-for="strongbox in strongboxes" :key="strongbox.id">
        <GameButton :kind="GameButtonKind.Row" @click="pickStrongbox(strongbox.id)">
          {{ names[strongbox.nameTextId] ?? "" }}
        </GameButton>
      </li>
    </ul>
    <ul>
      <li v-for="item in candidates" :key="item.id">
        <GameButton :kind="GameButtonKind.Row" @click="togglePick(item.id)">
          {{ item.definition.name }}
        </GameButton>
      </li>
    </ul>
    <p v-if="candidates.length === 0">{{ gameText[GameTextKey.MysticOfferingRequiresFiveStar] }}</p>
    <p v-if="!isReady">{{ gameText[GameTextKey.MysticOfferingNotEnough] }}</p>
    <GameButton :kind="GameButtonKind.Row" :disabled="!isReady" @click="isConfirming = true">
      {{ gameText[GameTextKey.MysticOfferingCreate] }}
    </GameButton>
    <template v-if="isConfirming">
      <p>
        {{
          fillGameTextValues(
            gameText[GameTextKey.MysticOfferingConfirm],
            pickedStrongbox?.needCount ?? 0,
            pickedStrongbox?.rarity ?? 0,
          )
        }}
      </p>
      <GameButton :kind="GameButtonKind.Row" @click="isConfirming = false">{{
        gameText[GameTextKey.Cancel]
      }}</GameButton>
      <GameButton :kind="GameButtonKind.Row" @click="create()">{{ gameText[GameTextKey.Confirm] }}</GameButton>
    </template>
    <GameButton :kind="GameButtonKind.Row" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</GameButton>
  </GameScreen>
</template>
