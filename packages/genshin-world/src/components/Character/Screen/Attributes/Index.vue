<script setup lang="ts">
import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GameText } from "genshin-text";

import CharacterAttributeList from "#src/components/Character/AttributeList/Index.vue";
import { Currency } from "#src/models/inventory/Currency";
import { ascendCharacter } from "#src/services/character/ascendCharacter";
import { checkIsLiftHeld } from "#src/services/character/checkIsLiftHeld";
import { MASTERLESS_LEVEL_LIFTS } from "#src/services/character/constants";
import { getAscensionMaterials } from "#src/services/character/getAscensionMaterials";
import { getNextAscensionPhase } from "#src/services/character/getNextAscensionPhase";
import { levelUpCharacter } from "#src/services/character/levelUpCharacter";
import { liftCharacterLevel } from "#src/services/character/liftCharacterLevel";
import { replaceCharacterInRoster } from "#src/services/character/replaceCharacterInRoster";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { GameTextKey } from "genshin-text";

interface Props {
  // The player's Adventure Rank, which an ascension's phase requires
  adventureRank: number;
  // The character whose attributes the panel shows, and whose ascension, level-up and lift its buttons take
  character: Character;
  // The character's name in the reader's language, the one the panel's title draws
  characterName: string;
  // The Friendship Level the character has reached, which the panel's Friendship row draws, none until given
  friendshipLevel?: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The game's material table by item id, which the materials an ascension takes are named from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The party's stamina, which the panel shows with the character's own attributes
  maxStamina: number;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's tables the character's attributes are summed from, and the phases its ascension is read from
  statTables: StatTables;
  // The bonuses the Traveler holds from the elements it resonated with, once Welkin Moon's Homecoming is done
  travelerBonusLines: AttributeLine[];
}

const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
const {
  adventureRank,
  character,
  characterName,
  friendshipLevel,
  gameText,
  materialDataMap,
  maxStamina,
  nameText,
  statTables,
  travelerBonusLines,
} = defineProps<Props>();
// The chosen character's ascension phases, looked up once for the rows and the two results below
const ascensionPhases = computed(() => statTables.characterDataMap.get(character.id)?.ascensionPhases);
// The phase the chosen character enters at its next ascension, as the Attributes tab lists it: the Adventure Rank it needs
// Against the player's, the Mora and the materials, each held against what it takes. None at its last phase, or where
// The table carries no cost for that phase yet
const ascendRows = computed(() => {
  const nextPhase = ascensionPhases.value && getNextAscensionPhase(ascensionPhases.value, character.ascension);
  if (nextPhase?.coinCost === undefined || nextPhase.requiredPlayerLevel === undefined) return [];
  return [
    { label: gameText[GameTextKey.AdventureRank], value: `${adventureRank}/${nextPhase.requiredPlayerLevel}` },
    { label: gameText[GameTextKey.Mora], value: `${wallet.value[Currency.Mora]}/${nextPhase.coinCost}` },
    ...getAscensionMaterials(nextPhase, inventory.value).map(({ count, held, id }) => ({
      label: getItemDefinition(id, nameText, materialDataMap).name,
      value: `${held}/${count}`,
    })),
  ];
});
// The chosen character ascended into its next phase, with the Mora and materials taken, or undefined where that is
// Refused now
const ascendResult = computed(() =>
  ascensionPhases.value
    ? ascendCharacter(character, {
        adventureRank,
        inventory: inventory.value,
        phases: ascensionPhases.value,
        wallet: wallet.value,
      })
    : undefined,
);
// The chosen character raised one level with its Character EXP materials, or undefined where that is refused now
const levelUpResult = computed(() => {
  const maxLevel = ascensionPhases.value?.[character.ascension]?.maxLevel;
  return maxLevel === undefined
    ? undefined
    : levelUpCharacter(character, { inventory: inventory.value, maxLevel, wallet: wallet.value });
});
// Whether the chosen character sits at a level cap a Masterless Stella Fortuna lifts, with the items in the bag for it
const isLiftable = computed(() => {
  const liftLevel = MASTERLESS_LEVEL_LIFTS.get(character.level);
  return liftLevel !== undefined && checkIsLiftHeld(inventory.value, liftLevel);
});
</script>

<template>
  <CharacterAttributeList
    :character
    :friendship-level="friendshipLevel"
    :game-text
    :ascend-rows
    :is-ascendable="ascendResult !== undefined"
    :is-level-upable="levelUpResult !== undefined"
    :is-liftable
    :traveler-bonus-lines
    :max-stamina
    :name="characterName"
    :stat-tables
    @ascend="
      () => {
        const ascended = ascendResult;
        if (!ascended) return;
        characters = replaceCharacterInRoster(characters, ascended.character);
        inventory = ascended.inventory;
        wallet = ascended.wallet;
      }
    "
    @level-up="
      () => {
        const raised = levelUpResult;
        if (!raised) return;
        characters = replaceCharacterInRoster(characters, raised.character);
        inventory = raised.inventory;
        wallet = raised.wallet;
      }
    "
    @lift="
      () => {
        if (!isLiftable) return;
        const lifted = liftCharacterLevel(character, { inventory });
        characters = replaceCharacterInRoster(characters, lifted.character);
        inventory = lifted.inventory;
      }
    "
  />
</template>
