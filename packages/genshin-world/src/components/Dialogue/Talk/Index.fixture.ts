import type { Talk } from "#src/models/dialogue/Talk";

import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { DialogueChoiceIcon } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Three states of the English PC client's dialogue at 720 high (`yt-nWBqOXWZuFg.mp4`): Sara's line with the Traveler's
// two replies on offer, about 18 seconds in; Sara's line with none, about 23 seconds in; and Paimon's, about 29 seconds
// in. Each is held whole by the start progress a reference names, so the state is the reference's props, not a clock.
// The talk's text ids are readable names for this fixture alone, not the game's
const TALK: Talk = {
  id: "dialogue-choices",
  lines: [
    {
      id: "ah-finally",
      kind: TalkLineKind.Spoken,
      nextLineIds: ["is-something-wrong", "sorry-already-ate"],
      speakerTextId: "sara",
      textId: "ah-finally",
      voiceId: "",
    },
    {
      icon: DialogueChoiceIcon.Talk,
      id: "is-something-wrong",
      kind: TalkLineKind.Choice,
      nextLineIds: [],
      textId: "is-something-wrong",
    },
    {
      icon: DialogueChoiceIcon.Talk,
      id: "sorry-already-ate",
      kind: TalkLineKind.Choice,
      nextLineIds: [],
      textId: "sorry-already-ate",
    },
    {
      id: "knights-of-favonius",
      kind: TalkLineKind.Spoken,
      nextLineIds: [],
      speakerTextId: "sara",
      textId: "knights-of-favonius",
      voiceId: "",
    },
    {
      id: "so-it-is-jean",
      kind: TalkLineKind.Spoken,
      nextLineIds: [],
      speakerTextId: "paimon",
      textId: "so-it-is-jean",
      voiceId: "",
    },
  ],
  startLineId: "ah-finally",
};

const TEXT_MAP: Record<string, string> = {
  "ah-finally": "Ah, finally, I caught you!",
  "is-something-wrong": "Is something wrong, Sara?",
  "knights-of-favonius":
    "I have something I'd like the Knights of Favonius to do for me, and I want you to pass on my request to the Acting Grand Master.",
  paimon: "Paimon",
  sara: "Sara",
  "so-it-is-jean": "Oh, so it's Jean you were really hoping to see.",
  "sorry-already-ate": "Sorry, I already ate.",
};

export const props = {
  gameText: ENGLISH_GAME_TEXT,
  startProgress: { isRevealed: true, lineId: "ah-finally" },
  talk: TALK,
  textMap: TEXT_MAP,
};
