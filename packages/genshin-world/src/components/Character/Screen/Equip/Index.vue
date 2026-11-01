<script setup lang="ts">
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";
import type { GameText } from "genshin-text";

import { equipBagArtifact } from "#src/services/artifact/equipBagArtifact";
import { getBagArtifactsForSlot } from "#src/services/artifact/getBagArtifactsForSlot";
import { replaceCharacterInRoster } from "#src/services/character/replaceCharacterInRoster";
import { ArtifactPicker } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The slot the picker is open for, whose bag artifacts it lists for the player to choose one from
  artifactSlot: ArtifactSlot;
  // The character whose slot the chosen artifact is worn in
  character: Character;
  // The game's words in the reader's language
  gameText: GameText;
  // The names the stat tables cite, in the reader's language, by their text id
  nameText: Readonly<Record<string, string>>;
  // The game's artifact sets, by which a worn artifact's bag definition is rebuilt and the bag's pieces are named
  reliquarySets: readonly ReliquarySetData[];
}

const characters = defineModel<Character[]>("characters", { required: true });
const inventory = defineModel<Inventory>("inventory", { required: true });
const { artifactSlot, character, gameText, nameText, reliquarySets } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The bag's artifacts for the slot, in the picker's options
const equipOptions = computed(() =>
  getBagArtifactsForSlot(inventory.value, artifactSlot).map(({ artifact, definition, id }) => ({
    caption: `+${artifact.level}`,
    id: String(id),
    name: definition.name,
    rarity: artifact.rarity,
  })),
);
</script>

<template>
  <ArtifactPicker
    :close-label="gameText[GameTextKey.Cancel]"
    :options="equipOptions"
    :title="gameText[GameTextKey.ArtifactActionEquip]"
    @choose="
      (id) => {
        // The artifact the player chose is worn, and the piece it wore goes back to the bag
        const equipped = equipBagArtifact(inventory, character, Number(id), { names: nameText, reliquarySets });
        characters = replaceCharacterInRoster(characters, equipped.character);
        inventory = equipped.inventory;
        emit('close');
      }
    "
    @close="emit('close')"
  />
</template>
