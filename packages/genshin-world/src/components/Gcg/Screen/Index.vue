<script setup lang="ts">
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";
import type { GameText } from "genshin-text";

import GcgScreenBand from "#src/components/Gcg/Screen/Band/Index.vue";
import GcgScreenCharacterRow from "#src/components/Gcg/Screen/CharacterRow/Index.vue";
import GcgScreenConfirm from "#src/components/Gcg/Screen/Confirm/Index.vue";
import GcgScreenDiceColumn from "#src/components/Gcg/Screen/DiceColumn/Index.vue";
import GcgScreenHand from "#src/components/Gcg/Screen/Hand/Index.vue";
import GcgScreenHud from "#src/components/Gcg/Screen/Hud/Index.vue";
import GcgScreenPlates from "#src/components/Gcg/Screen/Plates/Index.vue";
import GcgScreenRoundControls from "#src/components/Gcg/Screen/RoundControls/Index.vue";
import GcgScreenRoundControlsSynchro from "#src/components/Gcg/Screen/RoundControls/Synchro/Index.vue";
import GcgScreenSkillRow from "#src/components/Gcg/Screen/SkillRow/Index.vue";
import GcgScreenTable from "#src/components/Gcg/Screen/Table/Index.vue";
import { useGcgSelection } from "#src/composables/useGcgSelection";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GCG_SKILL_KIND_DISPLAY_ORDER } from "#src/services/gcg/constants";
import { listGcgActiveSkills } from "#src/services/gcg/effects/listGcgActiveSkills";
import { takeOne } from "@esposter/shared";
import { GameScreen, INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The battle of the challenge the duel is, from one, and how many battles the challenge plays
  battleNumber: number;
  battleTotal: number;
  // The duel as the engine holds it: its side the player steers and the other the opponent's
  duel: GcgDuel;
  // The game's words in the reader's language
  gameText: GameText;
  // The side the player steers
  playerSideIndex: number;
  // The names of the duel's characters and cards in the reader's language, by their game text ids
  textMap: Readonly<Record<string, string>>;
}

const { battleNumber, battleTotal, duel, gameText, playerSideIndex, textMap } = defineProps<Props>();
const emit = defineEmits<{
  declareRoundEnd: [];
  leave: [won: boolean];
  playCard: [handIndex: number, targetIndex: number | undefined, dieIndices: number[], choice?: GcgPlayChoice];
  prepare: [switchedHandIndices: number[], activeIndex: number];
  replaceCharacter: [characterIndex: number];
  reroll: [dieIndices: number[]];
  switchCharacter: [characterIndex: number, dieIndices: number[]];
  tuneDie: [handIndex: number, dieIndex: number];
  useSkill: [skillId: number, dieIndices: number[]];
}>();
const {
  addRerollGroup,
  armedHandIndex,
  clearSelection,
  confirmPreparation,
  confirmReroll,
  isActionLocked,
  isChoosingReroll,
  isPlayerTurn,
  isTuning,
  paidDiceIndices,
  playerCharacters,
  playerHandCards,
  playerSide,
  playRerollChoice,
  rerollHandIndex,
  selectCard,
  selectCharacter,
  selectDie,
  selectedDieIndices,
  switchedHandIndices,
  toggleTuning,
  useSkill,
} = useGcgSelection(
  () => duel,
  () => playerSideIndex,
  emit,
);
const opponentSide = computed(() => takeOne(duel.sides, 1 - playerSideIndex));
// The opponent's characters are never choosable
const opponentCharacters = computed(() =>
  opponentSide.value.characters.map((character) => ({ character, isChoosable: false })),
);
const isPlayerWinner = computed(() => duel.winnerSideIndex === playerSideIndex);
const activeSkills = computed(() =>
  listGcgActiveSkills(takeOne(playerSide.value.characters, playerSide.value.activeIndex)).toSorted(
    (firstSkill, secondSkill) =>
      GCG_SKILL_KIND_DISPLAY_ORDER.indexOf(firstSkill.kind) - GCG_SKILL_KIND_DISPLAY_ORDER.indexOf(secondSkill.kind),
  ),
);
const bandTextKey = computed(() => {
  if (duel.phase === GcgPhase.Preparation) return GameTextKey.GcgStartingHand;
  else if (duel.phase === GcgPhase.Roll) return GameTextKey.GcgRollPhase;
  else if (duel.phase === GcgPhase.Action) return GameTextKey.GcgActionPhase;
  return isPlayerWinner.value ? GameTextKey.GcgVictory : GameTextKey.GcgDefeat;
});
const roundLabel = computed(() => fillGameTextValues(gameText[GameTextKey.GcgRoundTitle], duel.round));
const battleLabel = computed(() =>
  fillGameTextValues(gameText[GameTextKey.DuelBattleCounter], battleNumber, battleTotal),
);
</script>

<template>
  <!-- The duel board as the game lays it out: the opponent's three characters across the top and the player's across the
       bottom, the active one raised, the band between them naming the phase, the dice down the right edge, the hand fanned
       along the bottom, and the round and end-round button at centre-left. Every word is the game's. The board holds only
       what the player is choosing; each choice leaves as an event for its host to play -->
  <GameScreen class="gcg-screen">
    <GcgScreenTable />
    <GcgScreenHud :battle-label :game-text @concede="emit('leave', false)" />
    <GcgScreenPlates />
    <GcgScreenCharacterRow
      class="opponent-row"
      :active-index="opponentSide.activeIndex"
      :characters="opponentCharacters"
      :text-map
    />
    <GcgScreenBand :label="gameText[bandTextKey]" />
    <GcgScreenCharacterRow
      class="player-row"
      :active-index="playerSide.activeIndex"
      :characters="playerCharacters"
      :text-map
      @select="(characterIndex) => selectCharacter(characterIndex)"
    />
    <GcgScreenDiceColumn
      :dice="playerSide.dice"
      :paid-dice-indices
      :selected-die-indices
      @select="(dieIndex) => selectDie(dieIndex)"
    />
    <GcgScreenHand
      :armed-hand-index
      :cards="playerHandCards"
      :reroll-hand-index
      :switched-hand-indices
      :text-map
      @select="(handIndex) => selectCard(handIndex)"
    />
    <GcgScreenRoundControls
      :game-text
      :is-action-locked
      :is-player-turn
      :round-label
      @declare-round-end="emit('declareRoundEnd')"
    />
    <GcgScreenRoundControlsSynchro :game-text :is-action-locked :is-tuning @toggle-tuning="toggleTuning()" />
    <GcgScreenSkillRow :is-disabled="isActionLocked" :skills="activeSkills" @select="(skillId) => useSkill(skillId)" />
    <GcgScreenConfirm
      :game-text
      :is-choosing-reroll
      :is-player-winner
      :phase="duel.phase"
      @add-reroll-group="addRerollGroup()"
      @clear-selection="clearSelection()"
      @leave="emit('leave', $event)"
      @play-reroll-choice="playRerollChoice()"
      @prepare="confirmPreparation()"
      @reroll="confirmReroll()"
    />
  </GameScreen>
</template>

<style scoped>
/* The board's places and colours are measured off the game's frame at 1080 high; its table's texture and the frame's
   ornament are not drawn. The buttons read their durations from the screen, so each is set once here */
.gcg-screen {
  --hover-duration: v-bind(INTERACTION_HOVER_DURATION);
  --rest-duration: v-bind(INTERACTION_REST_DURATION);
  background: #524236;
}

.opponent-row {
  top: calc(var(--unit) * 205);
  left: 0;
}

.player-row {
  top: calc(var(--unit) * 632);
  left: 0;
}
</style>
