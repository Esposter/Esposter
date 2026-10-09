<script setup lang="ts">
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GameText } from "genshin-text";

import GcgScreenCard from "#src/components/Gcg/Screen/Card/Index.vue";
import GcgScreenCharacter from "#src/components/Gcg/Screen/Character/Index.vue";
import GcgScreenDie from "#src/components/Gcg/Screen/Die/Index.vue";
import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { countGcgDiceCost } from "#src/services/gcg/countGcgDiceCost";
import { takeOne } from "@esposter/shared";
import { GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The duel as the engine holds it: its side the player steers and the other the opponent's
  duel: GcgDuel;
  // The game's words in the reader's language
  gameText: GameText;
  // The side the player steers
  playerSideIndex: number;
  // The names of the duel's characters and cards in the reader's language, by their game text ids
  textMap: Readonly<Record<string, string>>;
}

const { duel, gameText, playerSideIndex, textMap } = defineProps<Props>();
const emit = defineEmits<{
  declareRoundEnd: [];
  leave: [];
  playCard: [handIndex: number, targetIndex: number | undefined, dieIndices: number[]];
  prepare: [switchedHandIndices: number[], activeIndex: number];
  reroll: [dieIndices: number[]];
  replaceCharacter: [characterIndex: number];
  switchCharacter: [characterIndex: number, dieIndices: number[]];
  tuneDie: [handIndex: number, dieIndex: number];
  useSkill: [skillId: number, dieIndices: number[]];
}>();
// What the player is choosing: the dice it has picked to pay or reroll with, the hand card it is about to play onto a
// Character, whether its next hand card tunes its picked die, and the cards it has picked to switch away and the
// Character it has picked to start on
const selectedDieIndices = ref<number[]>([]);
const armedHandIndex = ref<number>();
const isTuning = ref(false);
const switchedHandIndices = ref<number[]>([]);
const preparedActiveIndex = ref(0);
const playerSide = computed(() => takeOne(duel.sides, playerSideIndex));
const opponentSide = computed(() => takeOne(duel.sides, 1 - playerSideIndex));
const isPlayerTurn = computed(() => duel.phase === GcgPhase.Action && duel.actingSideIndex === playerSideIndex);
// A hand's cards by their ids, which the side's own card definitions name
const playerHandCards = computed(() => {
  const cardMap = new Map(playerSide.value.cards.map((card) => [card.id, card]));
  return playerSide.value.hand.flatMap((cardId) => cardMap.get(cardId) ?? []);
});
// The skills the active character offers the player as its buttons, its normal attack, elemental skill and burst
const SKILL_KIND_ORDER = [GcgSkillKind.NormalAttack, GcgSkillKind.ElementalSkill, GcgSkillKind.ElementalBurst];
const activeSkills = computed(() =>
  takeOne(playerSide.value.characters, playerSide.value.activeIndex)
    .character.skills.filter(({ kind }) => kind !== GcgSkillKind.Passive)
    .toSorted((first, second) => SKILL_KIND_ORDER.indexOf(first.kind) - SKILL_KIND_ORDER.indexOf(second.kind)),
);
const bandTextKey = computed(() => {
  if (duel.phase === GcgPhase.Preparation) return GameTextKey.GcgStartingHand;
  else if (duel.phase === GcgPhase.Roll) return GameTextKey.GcgRollPhase;
  else if (duel.phase === GcgPhase.Action) return GameTextKey.GcgActionPhase;
  return duel.winnerSideIndex === playerSideIndex ? GameTextKey.GcgVictory : GameTextKey.GcgDefeat;
});
const roundLabel = computed(() => fillGameTextValues(gameText[GameTextKey.GcgRoundTitle], duel.round));
// The action card kinds that are equipped to a character, so a click on one waits for the character it goes onto
const EQUIPMENT_CARD_KINDS = new Set<GcgCardKind>([GcgCardKind.Artifact, GcgCardKind.Talent, GcgCardKind.Weapon]);

const toggleList = (list: number[], value: number): number[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
const clearSelection = () => {
  selectedDieIndices.value = [];
  armedHandIndex.value = undefined;
  isTuning.value = false;
};
const isCharacterChoosable = (characterIndex: number): boolean => {
  const character = takeOne(playerSide.value.characters, characterIndex);
  if (duel.phase === GcgPhase.Preparation) return true;
  else if (playerSide.value.isReplacementPending) return character.hp > 0;
  return isPlayerTurn.value && characterIndex !== playerSide.value.activeIndex;
};
const selectCard = (handIndex: number) => {
  const card = playerHandCards.value[handIndex];
  if (duel.phase === GcgPhase.Preparation) switchedHandIndices.value = toggleList(switchedHandIndices.value, handIndex);
  else if (!isPlayerTurn.value || !card) return;
  else if (isTuning.value) {
    if (selectedDieIndices.value.length === 1) emit("tuneDie", handIndex, takeOne(selectedDieIndices.value, 0));
    clearSelection();
  } else if (EQUIPMENT_CARD_KINDS.has(card.kind)) armedHandIndex.value = handIndex;
  else {
    emit("playCard", handIndex, undefined, selectedDieIndices.value);
    clearSelection();
  }
};
const selectCharacter = (characterIndex: number) => {
  const character = takeOne(playerSide.value.characters, characterIndex);
  if (duel.phase === GcgPhase.Preparation) preparedActiveIndex.value = characterIndex;
  else if (playerSide.value.isReplacementPending) {
    if (character.hp > 0) emit("replaceCharacter", characterIndex);
  } else if (armedHandIndex.value !== undefined) {
    emit("playCard", armedHandIndex.value, characterIndex, selectedDieIndices.value);
    clearSelection();
  } else if (isCharacterChoosable(characterIndex) && selectedDieIndices.value.length === 1) {
    emit("switchCharacter", characterIndex, selectedDieIndices.value);
    clearSelection();
  }
};
const useSkill = (skillId: number) => {
  if (!isPlayerTurn.value) return;
  emit("useSkill", skillId, selectedDieIndices.value);
  clearSelection();
};
const reroll = () => {
  emit("reroll", selectedDieIndices.value);
  clearSelection();
};
</script>

<template>
  <!-- The duel board as the game lays it out: the opponent's three characters across the top and the player's across the
       bottom, the active one raised, the band between them naming the phase, the dice down the right edge, the hand fanned
       along the bottom, and the round and end-round button at centre-left. Every word is the game's. The board holds only
       what the player is choosing; each choice leaves as an event for its host to play -->
  <GameScreen class="gcg-screen">
    <div class="table" />
    <div class="row opponent-row">
      <GcgScreenCharacter
        v-for="(character, index) in opponentSide.characters"
        :key="index"
        :aura="character.aura"
        :class="{ active: index === opponentSide.activeIndex }"
        :energy="character.energy"
        :hp="character.hp"
        :max-energy="character.character.maxEnergy"
        :name="textMap[character.character.nameTextId] ?? ''"
        :shield="character.shield"
      />
    </div>
    <div class="band">{{ gameText[bandTextKey] }}</div>
    <div class="row player-row">
      <GcgScreenCharacter
        v-for="(character, index) in playerSide.characters"
        :key="index"
        :aura="character.aura"
        :class="{ active: index === playerSide.activeIndex }"
        :energy="character.energy"
        :hp="character.hp"
        :is-choosable="isCharacterChoosable(index)"
        :max-energy="character.character.maxEnergy"
        :name="textMap[character.character.nameTextId] ?? ''"
        :shield="character.shield"
        @select="selectCharacter(index)"
      />
    </div>
    <div class="dice-column">
      <span class="dice-count">{{ playerSide.dice.length }}</span>
      <GcgScreenDie
        v-for="(face, index) in playerSide.dice"
        :key="index"
        :face
        :is-selected="selectedDieIndices.includes(index)"
        @select="selectedDieIndices = toggleList(selectedDieIndices, index)"
      />
    </div>
    <div class="hand">
      <GcgScreenCard
        v-for="(card, index) in playerHandCards"
        :key="index"
        :dice-count="countGcgDiceCost(card.costs)"
        :is-selected="armedHandIndex === index || switchedHandIndices.includes(index)"
        :name="textMap[card.nameTextId] ?? ''"
        @select="selectCard(index)"
      />
    </div>
    <button
      class="end-round"
      :aria-label="gameText[GameTextKey.GcgEndRound]"
      :disabled="!isPlayerTurn"
      type="button"
      @click="emit('declareRoundEnd')"
    />
    <div class="round">{{ roundLabel }}</div>
    <div v-if="isPlayerTurn" class="acting">{{ gameText[GameTextKey.GcgNowActing] }}</div>
    <div class="skills">
      <button
        v-for="skill in activeSkills"
        :key="skill.id"
        class="skill"
        :disabled="!isPlayerTurn"
        type="button"
        @click="useSkill(skill.id)"
      >
        <span class="skill-cost">{{ countGcgDiceCost(skill.costs) }}</span>
      </button>
    </div>
    <button
      class="synchro"
      :aria-pressed="isTuning"
      :disabled="!isPlayerTurn"
      type="button"
      @click="isTuning = !isTuning"
    >
      {{ gameText[GameTextKey.GcgElementalTuning] }}
    </button>
    <button class="concede" :aria-label="gameText[GameTextKey.GcgConcede]" type="button" @click="emit('leave')" />
    <div v-if="duel.phase === GcgPhase.Preparation" class="confirm">
      <button type="button" @click="emit('prepare', switchedHandIndices, preparedActiveIndex)">
        {{ gameText[GameTextKey.GcgConfirm] }}
      </button>
    </div>
    <div v-else-if="duel.phase === GcgPhase.Roll" class="confirm">
      <button type="button" @click="reroll()">{{ gameText[GameTextKey.GcgReroll] }}</button>
    </div>
    <div v-else-if="duel.phase === GcgPhase.Ended" class="confirm">
      <button type="button" @click="emit('leave')">{{ gameText[GameTextKey.GcgConfirm] }}</button>
    </div>
  </GameScreen>
</template>

<style scoped>
/* Provisional: the board's places, colours and sizes wait on the parity pass against the game's frame at 1080 high */
.gcg-screen {
  background: #557274;
}

.table {
  position: absolute;
  inset: calc(var(--unit) * 24);
  border: calc(var(--unit) * 22) solid #7d5a36;
  border-radius: calc(var(--unit) * 40);
}

.row {
  position: absolute;
  width: 0;
  height: 0;
}

.opponent-row {
  top: calc(var(--unit) * 205);
  left: 0;
}

.player-row {
  top: calc(var(--unit) * 632);
  left: 0;
}

.row > :nth-child(1) {
  left: calc(var(--unit) * 668);
}

.row > :nth-child(2) {
  left: calc(var(--unit) * 878);
}

.row > :nth-child(3) {
  left: calc(var(--unit) * 1088);
}

.row > .active {
  transform: translateY(calc(var(--unit) * -40));
}

.band {
  position: absolute;
  top: calc(var(--unit) * 512);
  right: 0;
  left: 0;
  height: calc(var(--unit) * 56);
  background: rgb(125 90 54 / 0.9);
  color: #f6e3a1;
  font-size: calc(var(--unit) * 32);
  font-weight: 700;
  line-height: calc(var(--unit) * 56);
  text-align: center;
}

.dice-column {
  position: absolute;
  top: calc(var(--unit) * 170);
  right: calc(var(--unit) * 26);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 5);
}

.dice-count {
  align-self: center;
  margin-bottom: calc(var(--unit) * 6);
  color: #f6e3a1;
  font-size: calc(var(--unit) * 24);
  font-weight: 700;
}

.hand {
  position: absolute;
  top: calc(var(--unit) * 975);
  left: calc(var(--unit) * 690);
  display: flex;
  align-items: flex-end;
}

.hand > * + * {
  margin-left: calc(var(--unit) * -35);
}

.end-round {
  position: absolute;
  top: calc(var(--unit) * 475);
  left: calc(var(--unit) * 20);
  width: calc(var(--unit) * 120);
  height: calc(var(--unit) * 120);
  border: calc(var(--unit) * 4) solid #c99a4a;
  border-radius: 50%;
  background: #7d5a36;
  cursor: inherit;
}

.round {
  position: absolute;
  top: calc(var(--unit) * 610);
  left: 0;
  width: calc(var(--unit) * 160);
  color: #f6e3a1;
  font-size: calc(var(--unit) * 20);
  text-align: center;
}

.acting {
  position: absolute;
  bottom: calc(var(--unit) * 16);
  left: calc(var(--unit) * 60);
  color: #f6e3a1;
  font-size: calc(var(--unit) * 22);
}

.skills {
  position: absolute;
  top: calc(var(--unit) * 905);
  left: calc(var(--unit) * 1556);
  display: flex;
  gap: calc(var(--unit) * 8);
}

.skill {
  width: calc(var(--unit) * 104);
  height: calc(var(--unit) * 104);
  border: calc(var(--unit) * 3) solid #c99a4a;
  border-radius: 50%;
  background: #7d5a36;
  color: #f6e3a1;
  cursor: inherit;
}

.skill-cost {
  font-size: calc(var(--unit) * 20);
  font-weight: 700;
}

.synchro,
.confirm button {
  position: absolute;
  padding: calc(var(--unit) * 8) calc(var(--unit) * 24);
  border: none;
  border-radius: calc(var(--unit) * 24);
  background: rgb(0 0 0 / 0.4);
  color: #f6e3a1;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
}

.synchro {
  top: calc(var(--unit) * 780);
  left: calc(var(--unit) * 1420);
}

.confirm {
  position: absolute;
  top: calc(var(--unit) * 860);
  left: calc(var(--unit) * 1420);
}

.concede {
  position: absolute;
  top: calc(var(--unit) * 30);
  right: calc(var(--unit) * 40);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border: calc(var(--unit) * 3) solid #c99a4a;
  border-radius: 50%;
  background: #7d5a36;
  cursor: inherit;
}
</style>
