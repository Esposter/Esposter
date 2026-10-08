import { DialogueChoiceIcon } from "#src/models/DialogueChoiceIcon";

// Sara's line at the bar and the Traveler's two replies on offer, from the English PC client's recording of the
// Dialogue choices at 720 high (`yt-nWBqOXWZuFg.mp4`, about 18 seconds in)
const LINE = "Ah, finally, I caught you!";

export const props = {
  choices: [
    { icon: DialogueChoiceIcon.Talk, id: "1", text: "Is something wrong, Sara?" },
    { icon: DialogueChoiceIcon.Talk, id: "2", text: "Sorry, I already ate." },
  ],
  line: LINE,
  revealedLength: LINE.length,
  selectedChoiceId: "1",
  speakerName: "Sara",
};
export const variants = { revealing: { choices: [], revealedLength: Math.floor(LINE.length / 2) } };
