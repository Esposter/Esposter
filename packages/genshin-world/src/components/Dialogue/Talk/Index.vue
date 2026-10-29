<script setup lang="ts">
import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkOffer } from "#src/models/dialogue/TalkOffer";
import type { TalkProgress } from "#src/models/dialogue/TalkProgress";
import type { GameText } from "genshin-text";

import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { advanceTalk } from "#src/services/dialogue/advanceTalk";
import { chooseTalkLine } from "#src/services/dialogue/chooseTalkLine";
import {
  DIALOGUE_DUEL_CHOICE_ID,
  DIALOGUE_OFFER_CHOICE_ID_PREFIX,
  TALK_AUTO_PLAY_HOLD_MS,
} from "#src/services/dialogue/constants";
import { getTalkChoices } from "#src/services/dialogue/getTalkChoices";
import { getTalkLine } from "#src/services/dialogue/getTalkLine";
import { getTalkRevealedLength } from "#src/services/dialogue/getTalkRevealedLength";
import { skipTalk } from "#src/services/dialogue/skipTalk";
import { LOGIN_TRAVELER_GENDER } from "#src/services/login/constants";
import { checkIsActionKey } from "#src/services/shared/checkIsActionKey";
import { useEventListener, useRafFn } from "@vueuse/core";
import { InputAction } from "genshin-engine";
import { DialogueChoiceIcon, DialogueScreen, GameScreen } from "genshin-interface";
import { fillLinePlaceholders, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the resident offers a duel of the card game with the reply it opens with, once that opening line is whole
  isDuelOffered: boolean;
  // The quest talks the opening line offers as replies once it is whole, each with its quest's mark
  offers: TalkOffer[];
  // Where the talk is held when it opens, on any of its lines and written out whole or not; its first line unwritten
  // When absent. The parity page holds a state the reference shows this way, the reveal's clock not running
  startProgress?: TalkProgress;
  talk: Talk;
  // The talk's own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { gameText, isDuelOffered, offers, startProgress, talk, textMap } = defineProps<Props>();
const emit = defineEmits<{ begin: [talkId: string]; duel: []; end: [] }>();
const progress = ref<TalkProgress>(startProgress ?? { isRevealed: false, lineId: talk.startLineId });
const isAutoPlaying = ref(false);
// The reply lit, -1 for none: as the game does, a reply is lit only by the pointer over it or the arrows
const selectedChoiceIndex = ref(-1);
// Time since the line on screen was shown, which writes it out, and then since it was whole, which auto-play holds it for
const elapsedMs = ref(0);
const talkLine = computed(() => (progress.value.lineId ? getTalkLine(talk, progress.value.lineId) : undefined));
// The Traveler's title as the login fills it, which stands for the player's nickname and the login's twin for their
// Gender until the world has a player profile
const travelerName = computed(() => fillLinePlaceholders(gameText[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER));
const fillLine = (text: string) => fillLinePlaceholders(text, travelerName.value, LOGIN_TRAVELER_GENDER);
const lineText = computed(() => (talkLine.value ? fillLine(textMap[talkLine.value.textId] ?? "") : ""));
const lineLength = computed(() => [...lineText.value].length);
const revealedLength = computed(() =>
  progress.value.isRevealed ? lineLength.value : getTalkRevealedLength(lineText.value, elapsedMs.value),
);
// The opening line offers the quest talks ahead of the talk's own replies and a duel after them, and choosing either
// Leaves the talk, for the quest's talk or the duel. Provisional: the offers' place ahead of the talk's own replies
// Waits on a recording of a resident offering a quest beside their chat
const choices = computed(() => {
  if (!progress.value.isRevealed) return [];
  const talkChoices = getTalkChoices(talk, progress.value.lineId).map(({ icon, id, textId }) => ({
    icon,
    id,
    text: fillLine(textMap[textId] ?? ""),
  }));
  if (progress.value.lineId !== talk.startLineId) return talkChoices;
  return [
    ...offers.map(({ icon, talkId, textId }) => ({
      icon,
      id: `${DIALOGUE_OFFER_CHOICE_ID_PREFIX}${talkId}`,
      text: fillLine(textMap[textId] ?? ""),
    })),
    ...talkChoices,
    ...(isDuelOffered
      ? [{ icon: DialogueChoiceIcon.Talk, id: DIALOGUE_DUEL_CHOICE_ID, text: gameText[GameTextKey.GcgChallenge] }]
      : []),
  ];
});
const setProgress = (newProgress: TalkProgress) => {
  if (newProgress.lineId !== progress.value.lineId) selectedChoiceIndex.value = -1;
  if (newProgress.lineId !== progress.value.lineId || newProgress.isRevealed !== progress.value.isRevealed)
    elapsedMs.value = 0;
  progress.value = newProgress;
  if (!newProgress.lineId) emit("end");
};
// A click, F or Space goes on unless the talk's own replies wait, which `advanceTalk` holds at. The opening line's
// Offers and duel do not hold it, so a standing talk with no replies of its own still runs on past them
const goOn = () => {
  setProgress(advanceTalk(talk, progress.value));
};
// Skip stops at the opening line written out whole while it offers a quest talk or a duel, as at any line asking for a
// Reply, so a skip never passes them by
const skip = () => {
  if (progress.value.lineId === talk.startLineId && (offers.length > 0 || isDuelOffered))
    setProgress({ ...progress.value, isRevealed: true });
  else setProgress(skipTalk(talk, progress.value));
};
const choose = (choiceId: string) => {
  if (choiceId === DIALOGUE_DUEL_CHOICE_ID) emit("duel");
  else if (choiceId.startsWith(DIALOGUE_OFFER_CHOICE_ID_PREFIX))
    emit("begin", choiceId.slice(DIALOGUE_OFFER_CHOICE_ID_PREFIX.length));
  else setProgress(chooseTalkLine(talk, progress.value, choiceId));
};

useRafFn(({ delta }) => {
  if (!progress.value.lineId) return;
  elapsedMs.value += delta;
  if (!progress.value.isRevealed) {
    if (revealedLength.value === lineLength.value) setProgress(advanceTalk(talk, progress.value));
  } else if (isAutoPlaying.value && choices.value.length === 0 && elapsedMs.value >= TALK_AUTO_PLAY_HOLD_MS)
    setProgress(advanceTalk(talk, progress.value));
});

// A key goes on as a click does when the game binds it to interact or jump, its F and Space, F chooses the lit reply
// When replies are on offer, and the arrows move the light between them
useEventListener("keydown", (event) => {
  const choice = choices.value[selectedChoiceIndex.value];
  if (event.code === "ArrowDown" || event.code === "ArrowUp") {
    const step = event.code === "ArrowDown" ? 1 : -1;
    selectedChoiceIndex.value = Math.max(Math.min(selectedChoiceIndex.value + step, choices.value.length - 1), 0);
  } else if (choice && checkIsActionKey(InputAction.Interact, event.code)) choose(choice.id);
  else if (checkIsActionKey(InputAction.Interact, event.code) || checkIsActionKey(InputAction.Jump, event.code)) goOn();
});
</script>

<template>
  <!-- A talk run over the world: the line written out a character at a time, a click, F or Space going on, the
       Replies chosen by a click or by F on the one lit, the opening line's quest talks and duel among them, auto-play
       Holding each whole line before going on until replies are on offer, and skip running on to the next replies or
       The end -->
  <GameScreen class="dialogue-talk">
    <DialogueScreen
      :choices
      :line="lineText"
      :revealed-length
      :selected-choice-id="choices[selectedChoiceIndex]?.id ?? ''"
      :speaker-name="
        talkLine?.kind === TalkLineKind.Spoken ? fillLine(textMap[talkLine.speakerTextId] ?? '') : travelerName
      "
      :speaker-role="talkLine?.kind === TalkLineKind.Spoken ? fillLine(textMap[talkLine.speakerRoleTextId] ?? '') : ''"
      @advance="goOn()"
      @choose="(choiceId) => choose(choiceId)"
    />
    <button class="auto" :aria-pressed="isAutoPlaying" type="button" @click="isAutoPlaying = !isAutoPlaying">
      {{ gameText[isAutoPlaying ? GameTextKey.DialogueAutoPlaying : GameTextKey.DialogueAuto] }}
    </button>
    <button class="skip" type="button" @click="skip()">
      {{ gameText[GameTextKey.Skip] }}
    </button>
  </GameScreen>
</template>

<style scoped>
/* Provisional: the buttons' places and looks wait on the parity pass, as the dialogue screen's do */
.auto,
.skip {
  position: absolute;
  top: calc(var(--unit) * 40);
  padding: calc(var(--unit) * 8) calc(var(--unit) * 24);
  border: none;
  border-radius: calc(var(--unit) * 24);
  background: rgb(0 0 0 / 0.35);
  color: #ece5d8;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
}

.auto {
  left: calc(var(--unit) * 60);
}

.skip {
  right: calc(var(--unit) * 60);
}
</style>
