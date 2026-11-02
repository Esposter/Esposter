import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgPlayChoice } from "#src/models/gcg/GcgPlayChoice";
import type { MaybeRefOrGetter } from "vue";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GCG_EQUIPMENT_CARD_KINDS, GCG_TOSS_UP_CARD_ID, GCG_TOSS_UP_REROLL_COUNT } from "#src/services/gcg/constants";
import { countGcgDiceCost } from "#src/services/gcg/countGcgDiceCost";
import { toGcgRemainingDiceIndices } from "#src/services/gcg/toGcgRemainingDiceIndices";
import { toggleGcgIndex } from "#src/services/gcg/toggleGcgIndex";
import { takeOne } from "@esposter/shared";
import { computed, ref, toValue } from "vue";

// The events a choice leaves the board with, which its host plays
interface GcgSelectionEmit {
  (
    event: "playCard",
    handIndex: number,
    targetIndex: number | undefined,
    dieIndices: number[],
    choice?: GcgPlayChoice,
  ): void;
  (event: "prepare", switchedHandIndices: number[], activeIndex: number): void;
  (event: "replaceCharacter", characterIndex: number): void;
  (event: "reroll", dieIndices: number[]): void;
  (event: "switchCharacter", characterIndex: number, dieIndices: number[]): void;
  (event: "tuneDie", handIndex: number, dieIndex: number): void;
  (event: "useSkill", skillId: number, dieIndices: number[]): void;
}

// The player's choices on the duel board and the events each one leaves with. The duel and the side the player steers are
// Read where each choice is made, so they are passed as getters that follow the board's props
export const useGcgSelection = (
  duel: MaybeRefOrGetter<GcgDuel>,
  playerSideIndex: MaybeRefOrGetter<number>,
  emit: GcgSelectionEmit,
) => {
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
  const playerSide = computed(() => takeOne(toValue(duel).sides, toValue(playerSideIndex)));
  const isPlayerTurn = computed(
    () => toValue(duel).phase === GcgPhase.Action && toValue(duel).actingSideIndex === toValue(playerSideIndex),
  );
  const isChoosingReroll = computed(() => rerollHandIndex.value !== undefined);
  const isActionLocked = computed(() => !isPlayerTurn.value || isChoosingReroll.value);
  // A hand's cards by their ids, which the side's own card definitions name
  const playerHandCards = computed(() => {
    const cardMap = new Map(playerSide.value.cards.map((card) => [card.id, card]));
    return playerSide.value.hand.flatMap((cardId) => cardMap.get(cardId) ?? []);
  });
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
    if (toValue(duel).phase === GcgPhase.Preparation) return true;
    else if (playerSide.value.isReplacementPending) return character.hp > 0;
    return isPlayerTurn.value && characterIndex !== playerSide.value.activeIndex && character.hp > 0;
  };
  // The player's characters in the order it holds them, each with whether a click on it does something for the player now
  const playerCharacters = computed(() =>
    playerSide.value.characters.map((character, characterIndex) => ({
      character,
      isChoosable: checkIsCharacterChoosable(characterIndex),
    })),
  );
  const selectCard = (handIndex: number) => {
    const card = playerHandCards.value[handIndex];
    if (isChoosingReroll.value) return;
    else if (toValue(duel).phase === GcgPhase.Preparation)
      switchedHandIndices.value = toggleGcgIndex(switchedHandIndices.value, handIndex);
    else if (!isPlayerTurn.value || !card) return;
    else if (isTuning.value) {
      if (selectedDieIndices.value.length === 1) emit("tuneDie", handIndex, takeOne(selectedDieIndices.value, 0));
      clearSelection();
    } else if (GCG_EQUIPMENT_CARD_KINDS.has(card.kind)) armedHandIndex.value = handIndex;
    else if (card.id === GCG_TOSS_UP_CARD_ID) {
      if (selectedDieIndices.value.length === countGcgDiceCost(card.costs)) {
        rerollHandIndex.value = handIndex;
        paidDiceIndices.value = selectedDieIndices.value;
        selectedDieIndices.value = [];
      }
    } else {
      emit("playCard", handIndex, undefined, selectedDieIndices.value);
      clearSelection();
    }
  };
  const selectCharacter = (characterIndex: number) => {
    if (isChoosingReroll.value) return;
    const character = takeOne(playerSide.value.characters, characterIndex);
    if (toValue(duel).phase === GcgPhase.Preparation) preparedActiveIndex.value = characterIndex;
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
    if (isActionLocked.value) return;
    emit("useSkill", skillId, selectedDieIndices.value);
    clearSelection();
  };
  const selectDie = (dieIndex: number) => {
    if (!paidDiceIndices.value.includes(dieIndex))
      selectedDieIndices.value = toggleGcgIndex(selectedDieIndices.value, dieIndex);
  };
  const toggleTuning = () => {
    isTuning.value = !isTuning.value;
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

  const confirmPreparation = () => {
    emit("prepare", switchedHandIndices.value, preparedActiveIndex.value);
  };
  const confirmReroll = () => {
    emit("reroll", selectedDieIndices.value);
    clearSelection();
  };

  return {
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
  };
};
