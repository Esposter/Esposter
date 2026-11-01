<script setup lang="ts">
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { ENHANCE_AUTO_ADD_MAX_RARITY } from "#src/services/artifact/constants";
import { enhanceArtifact } from "#src/services/artifact/enhanceArtifact";
import { enhanceCharacterArtifact } from "#src/services/artifact/enhanceCharacterArtifact";
import { getArtifactRarityData } from "#src/services/artifact/getArtifactRarityData";
import { getAutoAddFodders } from "#src/services/artifact/getAutoAddFodders";
import { getEnhancementMoraCost } from "#src/services/artifact/getEnhancementMoraCost";
import { getMaterialExperience } from "#src/services/artifact/getMaterialExperience";
import { takeFodderArtifacts } from "#src/services/artifact/takeFodderArtifacts";
import { replaceCharacterInRoster } from "#src/services/character/replaceCharacterInRoster";
import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { ArtifactEnhancePicker } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The slot the picker is open for, whose worn artifact is the one enhanced
  artifactSlot: ArtifactSlot;
  // The character whose worn artifact in that slot is enhanced
  character: Character;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's tables the artifact's rarity, its level cap and the EXP each material gives are read from
  statTables: StatTables;
}

const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const { artifactSlot, character, gameText, statTables } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The bag's artifacts chosen as fodder and the ore counts chosen by item id, which start with none chosen: the picker
// Is mounted again for each opening, so its choices never carry over from one enhancement to the next
const enhanceFodderIds = ref<number[]>([]);
const enhanceMaterialCounts = ref<Record<number, number>>({});
const enhanceArtifactWorn = computed(() => character.artifacts.find((worn) => worn.slot === artifactSlot));
const enhanceFodders = computed(() =>
  inventory.value.items.flatMap(({ artifact, id }) =>
    artifact && enhanceFodderIds.value.includes(id) ? [artifact] : [],
  ),
);
// The bag's unlocked artifacts in the order Auto Add takes them, the lowest star first and then the lowest level
const enhanceFodderOptions = computed(() =>
  inventory.value.items
    .flatMap(({ artifact, definition, id }) => (artifact && !artifact.isLocked ? [{ artifact, definition, id }] : []))
    .toSorted(
      (firstFodder, secondFodder) =>
        firstFodder.artifact.rarity - secondFodder.artifact.rarity ||
        firstFodder.artifact.level - secondFodder.artifact.level,
    )
    .map(({ artifact, definition, id }) => ({
      caption: `+${artifact.level}`,
      id: String(id),
      isSelected: enhanceFodderIds.value.includes(id),
      name: definition.name,
      rarity: artifact.rarity,
    })),
);
const enhanceMaterialOptions = computed(() =>
  inventory.value.items
    .filter(({ definition }) => statTables.artifactExpMaterialMap.has(definition.id))
    .map(({ definition, quantity }) => ({
      count: quantity,
      id: String(definition.id),
      name: definition.name,
      selectedCount: enhanceMaterialCounts.value[definition.id] ?? 0,
    })),
);
const enhanceMaterialItemCounts = computed(() =>
  Object.entries(enhanceMaterialCounts.value).flatMap(([id, count]) => (count > 0 ? [{ count, id: Number(id) }] : [])),
);
const enhanceMaterialExperience = computed(() =>
  getMaterialExperience(statTables.artifactExpMaterialMap, enhanceMaterialItemCounts.value),
);
const enhanceMoraCost = computed(() =>
  getEnhancementMoraCost({
    artifactRarityDataMap: statTables.artifactRarityDataMap,
    fodders: enhanceFodders.value,
    materialExperience: enhanceMaterialExperience.value,
  }),
);
// The level the worn artifact reaches with what is chosen at the base EXP bonus, the one the game shows before its draw
const enhanceLevelLabel = computed(() => {
  const artifact = enhanceArtifactWorn.value;
  if (!artifact) return "";
  const { level } = enhanceArtifact({
    artifact,
    artifactRarityDataMap: statTables.artifactRarityDataMap,
    fodders: enhanceFodders.value,
    materialExperience: enhanceMaterialExperience.value,
    random: () => 0,
  });
  return fillGameTextValues(gameText[GameTextKey.LevelFormat], String(level));
});
const isEnhanceMaxed = computed(() => {
  const artifact = enhanceArtifactWorn.value;
  return (
    artifact !== undefined &&
    artifact.level >= getArtifactRarityData(statTables.artifactRarityDataMap, artifact.rarity).maxLevel
  );
});
const enhanceNotice = computed(() => (isEnhanceMaxed.value ? gameText[GameTextKey.ArtifactLevelMax] : ""));
// Confirm waits on something chosen, Mora enough to pay for it, and an artifact still short of its top level
const isEnhanceConfirmDisabled = computed(
  () => enhanceMoraCost.value === 0 || enhanceMoraCost.value > wallet.value[Currency.Mora] || isEnhanceMaxed.value,
);
const autoAddEnhanceFodders = () => {
  const artifact = enhanceArtifactWorn.value;
  if (!artifact) return;
  enhanceFodderIds.value = getAutoAddFodders({
    artifact,
    artifactRarityDataMap: statTables.artifactRarityDataMap,
    inventory: inventory.value,
    maxRarity: ENHANCE_AUTO_ADD_MAX_RARITY,
  });
};
const toggleEnhanceFodder = (id: string) => {
  const entryId = Number(id);
  enhanceFodderIds.value = enhanceFodderIds.value.includes(entryId)
    ? enhanceFodderIds.value.filter((chosen) => chosen !== entryId)
    : [...enhanceFodderIds.value, entryId];
};
// A material's chosen count moves by one, kept between none and what the bag holds
const changeEnhanceMaterial = (id: string, delta: number) => {
  const itemId = Number(id);
  const held = inventory.value.items.find(({ definition }) => definition.id === itemId)?.quantity ?? 0;
  const selected = enhanceMaterialCounts.value[itemId] ?? 0;
  enhanceMaterialCounts.value = {
    ...enhanceMaterialCounts.value,
    [itemId]: Math.min(Math.max(selected + delta, 0), held),
  };
};
</script>

<template>
  <ArtifactEnhancePicker
    :auto-add-label="gameText[GameTextKey.ArtifactAutoAdd]"
    :cancel-label="gameText[GameTextKey.Cancel]"
    :confirm-label="gameText[GameTextKey.Confirm]"
    :fodders="enhanceFodderOptions"
    :is-confirm-disabled="isEnhanceConfirmDisabled"
    :level-label="enhanceLevelLabel"
    :materials="enhanceMaterialOptions"
    :mora-cost="enhanceMoraCost"
    :mora-label="gameText[GameTextKey.Mora]"
    :notice="enhanceNotice"
    :title="gameText[GameTextKey.ArtifactActionEnhance]"
    @auto-add="autoAddEnhanceFodders()"
    @cancel="emit('close')"
    @confirm="
      () => {
        if (isEnhanceConfirmDisabled) return;
        // The worn artifact is enhanced first, and the chosen fodder and materials leave the bag only once it is
        const enhanced = enhanceCharacterArtifact(character, artifactSlot, {
          artifactRarityDataMap: statTables.artifactRarityDataMap,
          fodders: enhanceFodders,
          materialExperience: enhanceMaterialExperience,
          random: Math.random,
          wallet,
        });
        const taken = takeFodderArtifacts(inventory, enhanceFodderIds);
        characters = replaceCharacterInRoster(characters, enhanced.character);
        wallet = enhanced.wallet;
        inventory = { ...taken, items: takeItemCounts(taken.items, enhanceMaterialItemCounts, 1) };
        emit('close');
      }
    "
    @fodder="(id) => toggleEnhanceFodder(id)"
    @material="(id, delta) => changeEnhanceMaterial(id, delta)"
  />
</template>
