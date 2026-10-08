import type { DialogueChoiceIcon } from "#src/models/DialogueChoiceIcon";

// One of the replies a dialogue offers, in the reader's language, with the mark it is drawn beside
export interface DialogueChoice {
  icon: DialogueChoiceIcon;
  id: string;
  text: string;
}
