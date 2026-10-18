import { InteractionState } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The Change World Level prompt in the English words, lowering the World Level from four to three, at rest and with both
// Choices hovered and pressed
export const props = {
  adjustPrompt: { adjustedWorldLevel: 3, currentWorldLevel: 4, isLowering: true },
  gameText: ENGLISH_GAME_TEXT,
};
// Restoring the lowered World Level, which the prompt draws with the revert tips and no question
export const variants = {
  hover: { interactionState: InteractionState.Hover },
  pressed: { interactionState: InteractionState.Pressed },
  revert: { adjustPrompt: { adjustedWorldLevel: 4, currentWorldLevel: 3, isLowering: false } },
};
