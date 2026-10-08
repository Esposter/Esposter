<script setup lang="ts">
import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkProgress } from "#src/models/dialogue/TalkProgress";
import type { GameText } from "genshin-text";

import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { advanceTalk } from "#src/services/dialogue/advanceTalk";
import { chooseTalkLine } from "#src/services/dialogue/chooseTalkLine";
import { TALK_AUTO_PLAY_HOLD_MS, TALK_REVEAL_MS_PER_CHARACTER } from "#src/services/dialogue/constants";
import { getTalkChoices } from "#src/services/dialogue/getTalkChoices";
import { getTalkLine } from "#src/services/dialogue/getTalkLine";
import { skipTalk } from "#src/services/dialogue/skipTalk";
import { checkIsActionKey } from "#src/services/shared/checkIsActionKey";
import { useEventListener, useRafFn } from "@vueuse/core";
import { InputAction } from "genshin-engine";
import { DialogueScreen, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  talk: Talk;
  // The talk's own words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { gameText, talk, textMap } = defineProps<Props>();
const emit = defineEmits<{ end: [] }>();
const progress = ref<TalkProgress>({ isRevealed: false, lineId: talk.startLineId });
const isAutoPlaying = ref(false);
const selectedChoiceIndex = ref(0);
// Time since the line on screen was shown, which writes it out, and then since it was whole, which auto-play holds it for
const elapsedMs = ref(0);
const talkLine = computed(() => (progress.value.lineId ? getTalkLine(talk, progress.value.lineId) : undefined));
const lineText = computed(() => (talkLine.value ? (textMap[talkLine.value.textId] ?? "") : ""));
const lineLength = computed(() => [...lineText.value].length);
const choices = computed(() =>
  progress.value.isRevealed
    ? getTalkChoices(talk, progress.value.lineId).map(({ icon, id, textId }) => ({
        icon,
        id,
        text: textMap[textId] ?? "",
      }))
    : [],
);
const setProgress = (newProgress: TalkProgress) => {
  if (newProgress.lineId !== progress.value.lineId) selectedChoiceIndex.value = 0;
  if (newProgress.lineId !== progress.value.lineId || newProgress.isRevealed !== progress.value.isRevealed)
    elapsedMs.value = 0;
  progress.value = newProgress;
  if (!newProgress.lineId) emit("end");
};
const choose = (choiceLineId: string) => {
  setProgress(chooseTalkLine(talk, progress.value, choiceLineId));
};

useRafFn(({ delta }) => {
  if (!progress.value.lineId) return;
  elapsedMs.value += delta;
  if (!progress.value.isRevealed) {
    if (elapsedMs.value >= lineLength.value * TALK_REVEAL_MS_PER_CHARACTER)
      setProgress(advanceTalk(talk, progress.value));
  } else if (isAutoPlaying.value && choices.value.length === 0 && elapsedMs.value >= TALK_AUTO_PLAY_HOLD_MS)
    setProgress(advanceTalk(talk, progress.value));
});

// A key goes on as a click does when the game binds it to interact or jump, its F and Space, F chooses the lit reply
// When replies are on offer, and the arrows move the light between them
useEventListener("keydown", (event) => {
  const choice = choices.value[selectedChoiceIndex.value];
  if (event.code === "ArrowDown" || event.code === "ArrowUp") {
    const step = event.code === "ArrowDown" ? 1 : -1;
    selectedChoiceIndex.value = Math.min(Math.max(selectedChoiceIndex.value + step, 0), choices.value.length - 1);
  } else if (choice && checkIsActionKey(InputAction.Interact, event.code)) choose(choice.id);
  else if (checkIsActionKey(InputAction.Interact, event.code) || checkIsActionKey(InputAction.Jump, event.code))
    setProgress(advanceTalk(talk, progress.value));
});
</script>

<template>
  <!-- A talk run over the world: the line written out a character at a time, a click, F or Space going on, the
       Replies chosen by a click or by F on the one lit, auto-play holding each whole line before going on until
       Replies are on offer, and skip running on to the next replies or the end -->
  <GameScreen class="dialogue-talk">
    <DialogueScreen
      :choices
      :line="lineText"
      :revealed-length="progress.isRevealed ? lineLength : Math.floor(elapsedMs / TALK_REVEAL_MS_PER_CHARACTER)"
      :selected-choice-id="choices[selectedChoiceIndex]?.id ?? ''"
      :speaker-name="
        talkLine?.kind === TalkLineKind.Spoken
          ? (textMap[talkLine.speakerTextId] ?? '')
          : gameText[GameTextKey.Traveler]
      "
      @advance="setProgress(advanceTalk(talk, progress))"
      @choose="(choiceLineId) => choose(choiceLineId)"
    />
    <button class="auto" :aria-pressed="isAutoPlaying" type="button" @click="isAutoPlaying = !isAutoPlaying">
      {{ gameText[isAutoPlaying ? GameTextKey.DialogueAutoPlaying : GameTextKey.DialogueAuto] }}
    </button>
    <button class="skip" type="button" @click="setProgress(skipTalk(talk, progress))">
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
