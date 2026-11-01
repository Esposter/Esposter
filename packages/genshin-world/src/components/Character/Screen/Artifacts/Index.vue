<script setup lang="ts">
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";
import type { GameText } from "genshin-text";

import { Attribute } from "#src/models/character/Attribute";
import { ArtifactSlotGameTextKeyMap } from "#src/services/artifact/ArtifactSlotGameTextKeyMap";
import { getActiveArtifactSetBonuses } from "#src/services/artifact/getActiveArtifactSetBonuses";
import { getArtifactDetailStats } from "#src/services/artifact/getArtifactDetailStats";
import { getArtifactSetBonusLines } from "#src/services/artifact/getArtifactSetBonusLines";
import { toggleCharacterArtifactLock } from "#src/services/artifact/toggleCharacterArtifactLock";
import { unequipArtifactToBag } from "#src/services/artifact/unequipArtifactToBag";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ARTIFACT_SLOT_ORDER } from "#src/services/character/constants";
import { formatWholeNumber } from "#src/services/character/formatWholeNumber";
import { getCharacterAttributeLines } from "#src/services/character/getCharacterAttributeLines";
import { replaceCharacterInRoster } from "#src/services/character/replaceCharacterInRoster";
import { CharacterMenuArtifacts } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The character whose artifacts the panel shows and whose pieces are locked, unequipped and held
  character: Character;
  // The game's words in the reader's language
  gameText: GameText;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's artifact sets, by which a worn artifact's bag definition is rebuilt and the bag's pieces are named
  reliquarySets: readonly ReliquarySetData[];
  // The game's tables the artifacts' stats and the sets' bonuses are read from
  statTables: StatTables;
}

const artifactNotice = defineModel<string>("artifactNotice", { required: true });
const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
// The slots the picker overlays are open for, which this panel's Equip and Enhance buttons open
const equipSlot = defineModel<ArtifactSlot>("equipSlot");
const enhanceSlot = defineModel<ArtifactSlot>("enhanceSlot");
const { character, gameText, nameText, reliquarySets, statTables } = defineProps<Props>();
// Each artifact slot's stats in the game's order, undefined where the character wears no artifact there
const artifactSlotStats = computed(() =>
  ARTIFACT_SLOT_ORDER.map((slot) => {
    const artifact = character.artifacts.find((wornArtifact) => wornArtifact.slot === slot);
    return artifact ? getArtifactDetailStats(artifact, gameText, statTables.artifactMainAffixCurves) : undefined;
  }),
);
// The artifact slots' names in the game's order
const artifactSlotNames = computed(() => ARTIFACT_SLOT_ORDER.map((slot) => gameText[ArtifactSlotGameTextKeyMap[slot]]));
// The set bonuses the worn artifacts reach, each naming the set it belongs to
const activeArtifactSetBonuses = computed(() =>
  getActiveArtifactSetBonuses(character.artifacts, statTables.artifactSetDataMap),
);
// Each set the worn artifacts make, with its name and its bonuses' lines
const artifactSetBonusGroups = computed(() =>
  Array.from(
    Map.groupBy(activeArtifactSetBonuses.value, ({ setId }) => setId),
    ([setId, setBonuses]) => {
      const nameTextId = reliquarySets.find(({ id }) => id === setId)?.nameTextId;
      return {
        lines: getArtifactSetBonusLines(setBonuses, gameText, nameText),
        name: nameTextId === undefined ? "" : nameText[nameTextId] || "",
      };
    },
  ),
);
const noSetBonusLabel = computed(() =>
  activeArtifactSetBonuses.value.length === 0 ? gameText[GameTextKey.ArtifactSetBonusNone] : "",
);
const formatTotal = (difference: number) => `+${formatWholeNumber(difference)}`;
// The attribute totals the worn artifacts add: each stat the character reaches with them less the one it reaches without
const artifactTotals = computed(() => {
  const worn = computeCharacterAttributes(getCharacterAttributeLines(character, statTables));
  const bare = computeCharacterAttributes(getCharacterAttributeLines({ ...character, artifacts: [] }, statTables));
  return [
    { label: gameText[GameTextKey.AttributeMaxHealth], value: formatTotal(worn.maxHealth - bare.maxHealth) },
    { label: gameText[GameTextKey.AttributeAttack], value: formatTotal(worn.attack - bare.attack) },
    { label: gameText[GameTextKey.AttributeDefense], value: formatTotal(worn.defense - bare.defense) },
    {
      label: gameText[GameTextKey.AttributeElementalMastery],
      value: formatTotal(
        worn.attributeTotalMap[Attribute.ElementalMastery] - bare.attributeTotalMap[Attribute.ElementalMastery],
      ),
    },
  ];
});
// Per slot, whether the bag holds no piece for it, which Equip is disabled on
const equipDisabledSlots = computed(() =>
  ARTIFACT_SLOT_ORDER.map((slot) => !inventory.value.items.some(({ artifact }) => artifact?.slot === slot)),
);
</script>

<template>
  <CharacterMenuArtifacts
    :artifact-details-label="gameText[GameTextKey.ArtifactDetails]"
    :enhance-label="gameText[GameTextKey.ArtifactActionEnhance]"
    :equip-disabled-slots
    :notice="artifactNotice"
    :equip-label="gameText[GameTextKey.ArtifactActionEquip]"
    :fast-equip-label="gameText[GameTextKey.ArtifactActionFastEquip]"
    :lock-label="gameText[GameTextKey.ArtifactActionLock]"
    :no-set-bonus-label
    :set-bonus-heading="gameText[GameTextKey.ArtifactSetBonusHeading]"
    :sets="artifactSetBonusGroups"
    :slot-names="artifactSlotNames"
    :slot-stats="artifactSlotStats"
    :switch-label="gameText[GameTextKey.QuickSwapSwitch]"
    :totals="artifactTotals"
    :unequip-label="gameText[GameTextKey.ArtifactActionUnequip]"
    :unlock-label="gameText[GameTextKey.ArtifactActionUnlock]"
    @enhance="
      (index) => {
        // The Enhance button opens the picker over the worn artifact's slot
        artifactNotice = '';
        enhanceSlot = ARTIFACT_SLOT_ORDER[index];
      }
    "
    @equip="
      (index) => {
        artifactNotice = '';
        equipSlot = ARTIFACT_SLOT_ORDER[index];
      }
    "
    @lock="
      (index) => {
        // The picked slot's worn artifact is locked or unlocked, which keeps it out of fodder
        const slot = ARTIFACT_SLOT_ORDER[index];
        if (!slot) return;
        artifactNotice = '';
        characters = replaceCharacterInRoster(characters, toggleCharacterArtifactLock(character, slot));
      }
    "
    @unequip="
      (index) => {
        // The worn artifact in the picked slot goes back to the bag, and nothing moves where the bag
        // Has no room for it
        const slot = ARTIFACT_SLOT_ORDER[index];
        if (!slot) return;
        const unequipped = unequipArtifactToBag(inventory, character, slot, { names: nameText, reliquarySets });
        if (unequipped.isBagFull) {
          artifactNotice = gameText[GameTextKey.ArtifactInventoryFull];
          return;
        }
        artifactNotice = '';
        characters = replaceCharacterInRoster(characters, unequipped.character);
        inventory = unequipped.inventory;
      }
    "
  />
</template>
