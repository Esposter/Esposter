<script setup lang="ts">
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";
import type { GameText } from "genshin-text";

import GcgScreenCard from "#src/components/Gcg/Screen/Card/Index.vue";
import GcgScreenCharacter from "#src/components/Gcg/Screen/Character/Index.vue";
import GcgScreenDie from "#src/components/Gcg/Screen/Die/Index.vue";
import GcgScreenSkill from "#src/components/Gcg/Screen/Skill/Index.vue";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import {
  GCG_EQUIPMENT_CARD_KINDS,
  GCG_SKILL_KIND_DISPLAY_ORDER,
  GCG_TOSS_UP_CARD_ID,
  GCG_TOSS_UP_REROLL_COUNT,
} from "#src/services/gcg/constants";
import { countGcgDiceCost } from "#src/services/gcg/countGcgDiceCost";
import { listGcgActiveSkills } from "#src/services/gcg/effects/listGcgActiveSkills";
import { toGcgRemainingDiceIndices } from "#src/services/gcg/toGcgRemainingDiceIndices";
import { takeOne } from "@esposter/shared";
import { GameScreen, INTERACTION_HOVER_MS, INTERACTION_REST_MS } from "genshin-interface";
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
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
// What the player is choosing: the dice it has picked to pay or reroll with, the hand card it is about to play onto a
// Character, whether its next hand card tunes its picked die, and the cards it has picked to switch away and the
// Character it has picked to start on
const selectedDieIndices = ref<number[]>([]);
const armedHandIndex = ref<number>();
const isTuning = ref(false);
const switchedHandIndices = ref<number[]>([]);
const preparedActiveIndex = ref(0);
// A Toss-Up being played: its hand card, the dice its payment took, and the groups of dice the player has picked to reroll
const rerollHandIndex = ref<number>();
const paidDiceIndices = ref<number[]>([]);
const rerollGroups = ref<number[][]>([]);
const playerSide = computed(() => takeOne(duel.sides, playerSideIndex));
const opponentSide = computed(() => takeOne(duel.sides, 1 - playerSideIndex));
const isPlayerTurn = computed(() => duel.phase === GcgPhase.Action && duel.actingSideIndex === playerSideIndex);
const isChoosingReroll = computed(() => rerollHandIndex.value !== undefined);
// A hand's cards by their ids, which the side's own card definitions name
const playerHandCards = computed(() => {
  const cardMap = new Map(playerSide.value.cards.map((card) => [card.id, card]));
  return playerSide.value.hand.flatMap((cardId) => cardMap.get(cardId) ?? []);
});
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
  return duel.winnerSideIndex === playerSideIndex ? GameTextKey.GcgVictory : GameTextKey.GcgDefeat;
});
const roundLabel = computed(() => fillGameTextValues(gameText[GameTextKey.GcgRoundTitle], duel.round));
const battleLabel = computed(() =>
  fillGameTextValues(gameText[GameTextKey.DuelBattleCounter], battleNumber, battleTotal),
);

const toggleList = (list: number[], value: number): number[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
const clearSelection = () => {
  selectedDieIndices.value = [];
  armedHandIndex.value = undefined;
  isTuning.value = false;
  rerollHandIndex.value = undefined;
  paidDiceIndices.value = [];
  rerollGroups.value = [];
};
const checkIsCharacterChoosable = (characterIndex: number): boolean => {
  const character = takeOne(playerSide.value.characters, characterIndex);
  if (duel.phase === GcgPhase.Preparation) return true;
  else if (playerSide.value.isReplacementPending) return character.hp > 0;
  return isPlayerTurn.value && characterIndex !== playerSide.value.activeIndex;
};
const selectCard = (handIndex: number) => {
  const card = playerHandCards.value[handIndex];
  if (isChoosingReroll.value) return;
  else if (duel.phase === GcgPhase.Preparation)
    switchedHandIndices.value = toggleList(switchedHandIndices.value, handIndex);
  else if (!isPlayerTurn.value || !card) return;
  else if (isTuning.value) {
    if (selectedDieIndices.value.length === 1) emit("tuneDie", handIndex, takeOne(selectedDieIndices.value, 0));
    clearSelection();
  } else if (GCG_EQUIPMENT_CARD_KINDS.has(card.kind)) armedHandIndex.value = handIndex;
  else if (card.id === GCG_TOSS_UP_CARD_ID) {
    if (selectedDieIndices.value.length === countGcgDiceCost(card.costs)) startRerollChoice(handIndex);
  } else {
    emit("playCard", handIndex, undefined, selectedDieIndices.value);
    clearSelection();
  }
};
const selectCharacter = (characterIndex: number) => {
  if (isChoosingReroll.value) return;
  const character = takeOne(playerSide.value.characters, characterIndex);
  if (duel.phase === GcgPhase.Preparation) preparedActiveIndex.value = characterIndex;
  else if (playerSide.value.isReplacementPending) {
    if (character.hp > 0) emit("replaceCharacter", characterIndex);
  } else if (armedHandIndex.value !== undefined) {
    emit("playCard", armedHandIndex.value, characterIndex, selectedDieIndices.value);
    clearSelection();
  } else if (checkIsCharacterChoosable(characterIndex) && selectedDieIndices.value.length === 1) {
    emit("switchCharacter", characterIndex, selectedDieIndices.value);
    clearSelection();
  }
};
const useSkill = (skillId: number) => {
  if (!isPlayerTurn.value || isChoosingReroll.value) return;
  emit("useSkill", skillId, selectedDieIndices.value);
  clearSelection();
};
const reroll = () => {
  emit("reroll", selectedDieIndices.value);
  clearSelection();
};
const selectDie = (dieIndex: number) => {
  if (!paidDiceIndices.value.includes(dieIndex))
    selectedDieIndices.value = toggleList(selectedDieIndices.value, dieIndex);
};
const startRerollChoice = (handIndex: number) => {
  rerollHandIndex.value = handIndex;
  paidDiceIndices.value = selectedDieIndices.value;
  selectedDieIndices.value = [];
};
const addRerollGroup = () => {
  if (selectedDieIndices.value.length === 0 || rerollGroups.value.length >= GCG_TOSS_UP_REROLL_COUNT) return;
  rerollGroups.value = [...rerollGroups.value, selectedDieIndices.value];
  selectedDieIndices.value = [];
};
const playRerollChoice = () => {
  const handIndex = rerollHandIndex.value;
  if (handIndex === undefined) return;
  addRerollGroup();
  emit("playCard", handIndex, undefined, paidDiceIndices.value, {
    rerollDiceIndices: toGcgRemainingDiceIndices(rerollGroups.value, paidDiceIndices.value),
  });
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
    <div class="support" />
    <div class="hud-disc record" />
    <div class="hud-disc history" />
    <div class="plate opponent-plate" />
    <div class="avatar opponent-avatar" />
    <div class="plate player-plate" />
    <div class="avatar player-avatar" />
    <div class="row opponent-row">
      <GcgScreenCharacter
        v-for="(character, index) in opponentSide.characters"
        :key="index"
        :aura="character.aura"
        :class="{ active: index === opponentSide.activeIndex }"
        :energy="character.energy"
        :hp="character.hp"
        :is-choosable="false"
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
        :is-choosable="checkIsCharacterChoosable(index)"
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
        :is-selected="selectedDieIndices.includes(index) || paidDiceIndices.includes(index)"
        @select="selectDie(index)"
      />
    </div>
    <div class="hand">
      <GcgScreenCard
        v-for="(card, index) in playerHandCards"
        :key="index"
        :dice-count="countGcgDiceCost(card.costs)"
        :is-selected="armedHandIndex === index || rerollHandIndex === index || switchedHandIndices.includes(index)"
        :name="textMap[card.nameTextId] ?? ''"
        @select="selectCard(index)"
      />
    </div>
    <button
      class="end-round"
      :aria-label="gameText[GameTextKey.GcgEndRound]"
      :disabled="!isPlayerTurn || isChoosingReroll"
      type="button"
      @click="emit('declareRoundEnd')"
    />
    <div class="round">{{ roundLabel }}</div>
    <div class="battle">{{ battleLabel }}</div>
    <div v-if="isPlayerTurn" class="acting">{{ gameText[GameTextKey.GcgNowActing] }}</div>
    <div class="skills">
      <GcgScreenSkill
        v-for="skill in activeSkills"
        :key="skill.id"
        :costs="skill.costs"
        :is-disabled="!isPlayerTurn || isChoosingReroll"
        @select="useSkill(skill.id)"
      />
    </div>
    <button
      class="synchro"
      :aria-pressed="isTuning"
      :disabled="!isPlayerTurn || isChoosingReroll"
      type="button"
      @click="isTuning = !isTuning"
    >
      {{ gameText[GameTextKey.GcgElementalTuning] }}
    </button>
    <button
      class="hud-disc concede ring-button"
      :aria-label="gameText[GameTextKey.GcgConcede]"
      type="button"
      @click="emit('leave', false)"
    />
    <div v-if="duel.phase === GcgPhase.Preparation" class="confirm">
      <button type="button" @click="emit('prepare', switchedHandIndices, preparedActiveIndex)">
        {{ gameText[GameTextKey.GcgConfirm] }}
      </button>
    </div>
    <div v-else-if="duel.phase === GcgPhase.Roll" class="confirm">
      <button type="button" @click="reroll()">{{ gameText[GameTextKey.GcgReroll] }}</button>
    </div>
    <div v-else-if="duel.phase === GcgPhase.Ended" class="confirm">
      <button type="button" @click="emit('leave', duel.winnerSideIndex === playerSideIndex)">
        {{ gameText[GameTextKey.GcgConfirm] }}
      </button>
    </div>
    <div v-else-if="isChoosingReroll" class="confirm">
      <button type="button" @click="addRerollGroup()">{{ gameText[GameTextKey.GcgReroll] }}</button>
      <button type="button" @click="playRerollChoice()">{{ gameText[GameTextKey.GcgConfirm] }}</button>
      <button type="button" @click="clearSelection()">{{ gameText[GameTextKey.Cancel] }}</button>
    </div>
  </GameScreen>
</template>

<style scoped src="genshin-interface/styles/ringButton.css"></style>

<style scoped>
/* The board's places and colours are measured off the game's frame at 1080 high; its table's texture and the frame's ornament are not drawn */
.gcg-screen {
  background: #524236;
}

/* The support zone at the left edge, a card's back whose trefoil is art: its plate is the panel's own colour */
.support {
  position: absolute;
  top: calc(var(--unit) * 710);
  left: 0;
  width: calc(var(--unit) * 186);
  height: calc(var(--unit) * 174);
  background: #343340;
}

.table {
  position: absolute;
  top: calc(var(--unit) * 72);
  right: calc(var(--unit) * 52);
  bottom: calc(var(--unit) * 76);
  left: calc(var(--unit) * 46);
  border: calc(var(--unit) * 22) solid #7d5a36;
  border-radius: calc(var(--unit) * 40);
  background: radial-gradient(
    calc(var(--unit) * 1000) calc(var(--unit) * 700) at 50% 50%,
    #7c9c9d 0%,
    #759392 45%,
    #6d8b8a 56%,
    #597474 73%,
    #557070 80%,
    #435d5e 92%,
    #3e5352 100%
  );
}

/* The two name plates and their portrait discs, the portraits' art not drawn: each plate is the colour the frame holds under its name */
.plate {
  position: absolute;
  border-radius: 0 calc(var(--unit) * 20) calc(var(--unit) * 20) 0;
}

.opponent-plate {
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 118);
  width: calc(var(--unit) * 248);
  height: calc(var(--unit) * 42);
  background: #3a5274;
}

/* The player's plate is the frame's gold, lit at its left under the name and dark at its right end */
.player-plate {
  top: calc(var(--unit) * 978);
  left: calc(var(--unit) * 130);
  width: calc(var(--unit) * 238);
  height: calc(var(--unit) * 42);
  background: linear-gradient(
    to right,
    #bd8e4e 0%,
    #e6ad66 25%,
    #e6ad66 46%,
    #c38f52 67%,
    #8f642c 80%,
    #7a5631 90%,
    #5d4630 100%
  );
}

.avatar {
  position: absolute;
  box-sizing: border-box;
  width: calc(var(--unit) * 76);
  height: calc(var(--unit) * 76);
  border: calc(var(--unit) * 4) solid;
  border-radius: 50%;
}

/* Each portrait disc is the frame's ring around its art, the art's own mean colour inside */
.opponent-avatar {
  top: calc(var(--unit) * 21);
  left: calc(var(--unit) * 51);
  width: calc(var(--unit) * 84);
  height: calc(var(--unit) * 84);
  border-width: calc(var(--unit) * 8);
  border-color: #5f7fa6;
  background: #acb0c0;
}

.player-avatar {
  top: calc(var(--unit) * 975);
  left: calc(var(--unit) * 51);
  width: calc(var(--unit) * 84);
  height: calc(var(--unit) * 84);
  border-color: #c99a4a;
  background: #ece3c8;
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
  background: #6f6857;
  color: #f6e3a1;
  font-size: calc(var(--unit) * 38);
  font-weight: 700;
  line-height: calc(var(--unit) * 56);
  text-align: center;
}

.dice-column {
  position: absolute;
  top: calc(var(--unit) * 107);
  right: calc(var(--unit) * 26);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--unit) * 5);
}

.dice-count {
  display: grid;
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  margin-bottom: calc(var(--unit) * 14);
  place-items: center;
  border: calc(var(--unit) * 4) solid #e8c060;
  border-radius: 50%;
  background: #917254;
  color: #fff;
  font-size: calc(var(--unit) * 30);
  font-weight: 700;
}

/* The hand's cards step 83.75 apart across the frame's five, the first at 694 */
.hand {
  position: absolute;
  top: calc(var(--unit) * 974);
  left: calc(var(--unit) * 694);
  display: flex;
  align-items: flex-end;
}

.hand > * + * {
  margin-left: calc(var(--unit) * -91.25);
}

/* The end-round token is the frame's gold coin in its bronze bevel, 128 across, the coin's gold 76 inside a dark rim */
.end-round {
  --state-duration: v-bind(restDuration);
  position: absolute;
  top: calc(var(--unit) * 477);
  left: calc(var(--unit) * 16);
  width: calc(var(--unit) * 128);
  height: calc(var(--unit) * 128);
  border: calc(var(--unit) * 20) solid #6e553b;
  border-radius: 50%;
  background: #e6a83e;
  box-shadow: inset 0 0 0 calc(var(--unit) * 6) #4f3524;
  cursor: inherit;
  outline: calc(var(--unit) * 1) solid transparent;
  transition:
    filter var(--state-duration),
    outline-color var(--state-duration);
}

@media (hover: hover) {
  .end-round:enabled:hover {
    --state-duration: v-bind(hoverDuration);
    outline-color: #fff;
  }
}

.end-round:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
  outline-color: #fff;
}

.end-round:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
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

/* The battle counter sits under the host's name at the top left, its words cap-high at 74 and on the baseline at 87 */
.battle {
  position: absolute;
  top: calc(var(--unit) * 69.5);
  left: calc(var(--unit) * 148);
  color: #c8d6e8;
  font-size: calc(var(--unit) * 19);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * -0.3);
  line-height: calc(var(--unit) * 22);
}

.acting {
  position: absolute;
  top: calc(var(--unit) * 1024);
  left: calc(var(--unit) * 146);
  color: #f6e3a1;
  font-size: calc(var(--unit) * 20);
}

/* The skill coins sit 108 apart, 94 across, their costs in a token beneath each, as the frame draws them */
.skills {
  position: absolute;
  top: calc(var(--unit) * 908);
  left: calc(var(--unit) * 1560);
  display: flex;
  gap: calc(var(--unit) * 14);
}

.synchro,
.confirm button {
  --state-duration: v-bind(restDuration);
  padding: calc(var(--unit) * 8) calc(var(--unit) * 24);
  border: none;
  border-radius: calc(var(--unit) * 24);
  background: rgb(0 0 0 / 0.4);
  color: #f6e3a1;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  outline: calc(var(--unit) * 1) solid transparent;
  transition:
    filter var(--state-duration),
    outline-color var(--state-duration);
}

.synchro {
  position: absolute;
  top: calc(var(--unit) * 780);
  left: calc(var(--unit) * 1420);
}

@media (hover: hover) {
  .synchro:enabled:hover,
  .confirm button:enabled:hover {
    --state-duration: v-bind(hoverDuration);
    outline-color: #fff;
  }
}

.synchro:enabled:is(:focus-visible, [data-interaction-state="Hover"] *),
.confirm button:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
  outline-color: #fff;
}

.synchro:enabled:is(:active, [data-interaction-state="Pressed"] *),
.confirm button:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}

/* The buttons take their places in the row, so a choice's Reroll, Confirm and Cancel never stack on one another */
.confirm {
  position: absolute;
  top: calc(var(--unit) * 860);
  left: calc(var(--unit) * 1420);
  display: flex;
  gap: calc(var(--unit) * 16);
}

/* The three round buttons of the top right: the concede beside a record and a history disc the frame shows, their icons not drawn */
.hud-disc {
  position: absolute;
  top: calc(var(--unit) * 20);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border: calc(var(--unit) * 3) solid #c99a4a;
  border-radius: 50%;
  background: #7d5a36;
}

.record {
  left: calc(var(--unit) * 1672);
}

.history {
  left: calc(var(--unit) * 1747);
}

.concede {
  --hover-duration: v-bind(hoverDuration);
  --state-duration: v-bind(restDuration);
  right: calc(var(--unit) * 26);
  cursor: inherit;
  outline: calc(var(--unit) * 1) solid transparent;
  transition:
    filter var(--state-duration),
    outline-color var(--state-duration);
}

.concede:is(:active, [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}
</style>
