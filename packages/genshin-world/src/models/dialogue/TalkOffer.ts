import type { DialogueChoiceIcon } from "genshin-interface";

// A talk offered as a reply on a resident's standing talk: the quest talk open to them by id, drawn with its quest's
// Mark and named by its words' text id
export interface TalkOffer {
  icon: DialogueChoiceIcon;
  talkId: string;
  textId: string;
}
