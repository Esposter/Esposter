import type { DecodedCurve } from "#src/models/genshinAssets/shared/DecodedCurve";

// An animation clip decoded: its name, its span in seconds and its curves sampled over it
export interface DecodedClip {
  curves: DecodedCurve[];
  duration: number;
  name: string;
}
