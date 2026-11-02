<script setup lang="ts">
import type { TextChunk } from "#src/models/data/TextChunk";
import type { DomainLevelRow } from "#src/models/domains/DomainLevelRow";
import type { AbyssBenedictionChoice } from "#src/models/spiralAbyss/AbyssBenedictionChoice";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssPeriodBlessing } from "#src/models/spiralAbyss/AbyssPeriodBlessing";
import type { GameText } from "genshin-text";

import DomainScreen from "#src/components/Domain/Screen/Index.vue";
import SpiralAbyssBenediction from "#src/components/SpiralAbyss/Benediction/Index.vue";
import SpiralAbyssEntryScreen from "#src/components/SpiralAbyss/Entry/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";

interface Props {
  abyssBlessing?: AbyssPeriodBlessing;
  abyssChoiceChamberIndex?: number;
  abyssChoiceFloorIndex?: number;
  abyssChoices?: AbyssBenedictionChoice[];
  abyssFloorsOffered: AbyssFloor[];
  domainLevels: DomainLevelRow[];
  gameText: GameText;
  isInDomain: boolean;
  nameText: TextChunk;
  screenKind: ScreenKind;
}

const {
  abyssBlessing,
  abyssChoiceChamberIndex,
  abyssChoiceFloorIndex,
  abyssChoices,
  abyssFloorsOffered,
  domainLevels,
  gameText,
  isInDomain,
  nameText,
  screenKind,
} = defineProps<Props>();
const emit = defineEmits<{
  chooseAbyssChamber: [floorId: number, chamberId: number];
  chooseBenediction: [towerBuffId: number];
  close: [];
  enter: [dungeonId: number];
  leaveDomain: [];
}>();
</script>

<template>
  <DomainScreen
    v-if="screenKind === ScreenKind.Domain"
    :game-text
    :is-in-domain
    :levels="domainLevels"
    @close="emit('close')"
    @enter="(dungeonId) => emit('enter', dungeonId)"
    @leave="emit('leaveDomain')"
  />
  <SpiralAbyssEntryScreen
    v-if="screenKind === ScreenKind.SpiralAbyss"
    :blessing="abyssBlessing"
    :floors="abyssFloorsOffered"
    :game-text
    :name-text
    @choose="(floorId, chamberId) => emit('chooseAbyssChamber', floorId, chamberId)"
    @close="emit('close')"
  />
  <SpiralAbyssBenediction
    v-if="abyssChoices"
    :chamber="abyssChoiceChamberIndex"
    :choices="abyssChoices"
    :floor="abyssChoiceFloorIndex"
    :game-text
    :name-text
    @choose="(towerBuffId) => emit('chooseBenediction', towerBuffId)"
  />
</template>
