// What a forward sends from its panel: the note it carries, and the rooms it is sent to
export interface ForwardDraft {
  message: string;
  roomIds: string[];
}
