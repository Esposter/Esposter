// The Change World Level prompt's contents: the World Level now, the one the change sets, and whether the change lowers
// It
export interface WorldLevelAdjustPrompt {
  adjustedWorldLevel: number;
  currentWorldLevel: number;
  isLowering: boolean;
}
