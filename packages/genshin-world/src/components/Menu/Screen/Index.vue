<script setup lang="ts">
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import MenuPaimon from "#src/components/Menu/Paimon/Index.vue";
import MenuPlaceholder from "#src/components/Menu/Placeholder/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ScreenKindGameTextKeyMap } from "#src/services/screen/ScreenKindGameTextKeyMap";

interface Props {
  // The Adventure EXP's share of the rank's bar, and the rank and World Level the profile card shows
  adventureExpProgress: number;
  adventureRank: number;
  // The game's words in the reader's language
  gameText: GameText;
  worldLevel: number;
}

// Each built screen, by its kind, as its host draws it with what it needs and closes it by setting the world back
const slots = defineSlots<Partial<Record<TitledScreenKind, () => VNode>>>();
const screenKind = defineModel<ScreenKind>("screenKind", { required: true });
const { gameText } = defineProps<Props>();
const emit = defineEmits<{ quit: [] }>();
</script>

<template>
  <!-- The screen open over the world: the Paimon menu, a built screen its host draws, or the placeholder of one the
       World does not have yet under its title, every one closing back to the world -->
  <MenuPaimon
    v-if="screenKind === ScreenKind.PaimonMenu"
    :adventure-exp-progress
    :adventure-rank
    :check-is-built="(titledScreenKind) => Boolean(slots[titledScreenKind])"
    :game-text
    :world-level
    @close="screenKind = ScreenKind.World"
    @open="(titledScreenKind) => (screenKind = titledScreenKind)"
    @quit="emit('quit')"
  />
  <slot
    v-else-if="screenKind !== ScreenKind.World && screenKind !== ScreenKind.Dialogue && slots[screenKind]"
    :name="screenKind"
  />
  <MenuPlaceholder
    v-else-if="screenKind !== ScreenKind.World && screenKind !== ScreenKind.Dialogue"
    :game-text
    :title="gameText[ScreenKindGameTextKeyMap[screenKind]]"
    @close="screenKind = ScreenKind.World"
  />
</template>
