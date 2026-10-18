// A character the expedition screen's picker lists: its name in the reader's language, the words of the expedition
// Bonus it holds, and its status when it is away, which is empty while it is free to be sent
export interface ExpeditionCharacter {
  bonusLabel: string;
  id: number;
  label: string;
  statusLabel: string;
}
