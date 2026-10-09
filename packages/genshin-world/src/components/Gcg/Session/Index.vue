<script setup lang="ts">
import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GameText, GameLanguage } from "genshin-text";

import GcgScreen from "#src/components/Gcg/Screen/Index.vue";
import { declareGcgRoundEnd } from "#src/services/gcg/declareGcgRoundEnd";
import { advanceGcgOpponent } from "#src/services/gcg/advanceGcgOpponent";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { GcgTextLoaderMap } from "#src/services/gcg/GcgTextLoaderMap";
import { playGcgCard } from "#src/services/gcg/playGcgCard";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { readGcgDeck } from "#src/services/gcg/readGcgDeck";
import { readGcgGame } from "#src/services/gcg/readGcgGame";
import { readGcgStandardRule } from "#src/services/gcg/readGcgStandardRule";
import { replaceGcgCharacter } from "#src/services/gcg/replaceGcgCharacter";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { switchGcgCharacter } from "#src/services/gcg/switchGcgCharacter";
import { tuneGcgDie } from "#src/services/gcg/tuneGcgDie";
import { useGcgSkill } from "#src/services/gcg/useGcgSkill";
import { getResultAsync } from "@esposter/shared";

interface Props {
  // The duel of the card game's own table the resident offers, by its game id there
  gameId: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The reader's game language, whose card game words the duel loads
  language: GameLanguage;
}

const { gameId, gameText, language } = defineProps<Props>();
const emit = defineEmits<{ leave: [] }>();
// The side the player steers is the duel's first, and the opponent the resident's, which the scripted policy takes its turns by
const PLAYER_SIDE_INDEX = 0;
const OPPONENT_SIDE_INDEX = 1;
const duel = ref<GcgDuel>();
const textMap = shallowRef<Readonly<Record<string, string>>>({});

// Sets a duel up from its game: both decks and the rule read, the duel opened with the player's first, and the opponent
// Brought through its preparation before the player is asked for its own
const createSessionDuel = async (): Promise<GcgDuel> => {
  const game = readGcgGame(gameId);
  const [playerDeck, opponentDeck, rule] = await Promise.all([
    readGcgDeck(game.playerDeckId),
    readGcgDeck(game.enemyDeckId),
    readGcgStandardRule(),
  ]);
  const newDuel = createGcgDuel([playerDeck, opponentDeck], Math.random, rule);
  advanceGcgOpponent(newDuel, OPPONENT_SIDE_INDEX, Math.random);
  return newDuel;
};
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(createSessionDuel).match(
  (newDuel) => {
    duel.value = newDuel;
  },
  (error) => {
    console.error(error);
  },
);
// oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
getResultAsync(() => GcgTextLoaderMap[language]()).match(
  (newTextMap) => {
    textMap.value = newTextMap;
  },
  (error) => {
    console.error(error);
  },
);

// A player's action on the duel, then the opponent's turns the scripted policy takes until the player is asked again
const playerAction = (action: (currentDuel: GcgDuel) => unknown) => {
  const currentDuel = duel.value;
  if (!currentDuel) return;
  action(currentDuel);
  advanceGcgOpponent(currentDuel, OPPONENT_SIDE_INDEX, Math.random);
};
</script>

<template>
  <!-- A duel of the card game at a resident's table: the player's choices are the board's events, each played by the
       engine and then the opponent's turns taken by the scripted policy. The duel leaves to the world when the board
       leaves it, its outcome shown on the board until then -->
  <GcgScreen
    v-if="duel"
    :duel
    :game-text
    :player-side-index="PLAYER_SIDE_INDEX"
    :text-map="textMap"
    @declare-round-end="
      playerAction((currentDuel) => declareGcgRoundEnd(currentDuel, PLAYER_SIDE_INDEX, currentDuel.rule, Math.random))
    "
    @leave="emit('leave')"
    @play-card="
      (handIndex, targetIndex, dieIndices) =>
        playerAction((currentDuel) => playGcgCard(currentDuel, PLAYER_SIDE_INDEX, handIndex, targetIndex, dieIndices))
    "
    @prepare="
      (switchedHandIndices, activeIndex) =>
        playerAction((currentDuel) =>
          prepareGcgSide(currentDuel, PLAYER_SIDE_INDEX, switchedHandIndices, activeIndex, Math.random),
        )
    "
    @reroll="
      (dieIndices) =>
        playerAction((currentDuel) => rerollGcgDice(currentDuel, PLAYER_SIDE_INDEX, dieIndices, Math.random))
    "
    @replace-character="
      (characterIndex) =>
        playerAction((currentDuel) => replaceGcgCharacter(currentDuel, PLAYER_SIDE_INDEX, characterIndex))
    "
    @switch-character="
      (characterIndex, dieIndices) =>
        playerAction((currentDuel) => switchGcgCharacter(currentDuel, PLAYER_SIDE_INDEX, characterIndex, dieIndices))
    "
    @tune-die="
      (handIndex, dieIndex) =>
        playerAction((currentDuel) => tuneGcgDie(currentDuel, PLAYER_SIDE_INDEX, handIndex, dieIndex))
    "
    @use-skill="
      (skillId, dieIndices) =>
        playerAction((currentDuel) => useGcgSkill(currentDuel, PLAYER_SIDE_INDEX, skillId, dieIndices))
    "
  />
</template>
