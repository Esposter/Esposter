import type { SrgbColor } from "#shared/models/shared/SrgbColor";

// The colours a node is drawn in, each inherited from its nearest ancestor that sets one, and absent where no colour could be read
export interface EffectiveColors {
  background?: SrgbColor;
  textColor?: SrgbColor;
}
