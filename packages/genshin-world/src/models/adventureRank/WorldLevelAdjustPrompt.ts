// The Change World Level prompt: the World Level now, the one the change sets, and whether the change lowers it
export interface WorldLevelAdjustPrompt {
  adjustedWorldLevel: number;
  currentWorldLevel: number;
  isLowering: boolean;
}
