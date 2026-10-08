import { DialogueChoiceIcon } from "#src/models/DialogueChoiceIcon";

// Paimon waking the Traveler at the prologue's start, the Traveler's reply on offer, and the line half written out
const LINE = "You said we'd watch the sunrise together, how are you still asleep?";

export const props = {
  choices: [{ icon: DialogueChoiceIcon.Talk, id: "3510103", text: "Wow..." }],
  line: LINE,
  revealedLength: LINE.length,
  speakerName: "Paimon",
};
export const variants = { revealing: { choices: [], revealedLength: Math.floor(LINE.length / 2) } };
