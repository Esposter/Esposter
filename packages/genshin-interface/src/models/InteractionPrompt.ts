import type { InteractionKind } from "#src/models/InteractionKind";

// A row of the prompts beside the character: the thing's id, what acting on it does, and its name in the reader's
// Language
export interface InteractionPrompt {
  id: string;
  kind: InteractionKind;
  name: string;
}
