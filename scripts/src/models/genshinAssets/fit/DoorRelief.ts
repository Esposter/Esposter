import type { PlanTones } from "#src/models/genshinAssets/fit/PlanTones";

// The door's front read off its texture as the tones it is painted in, inside the relief's corner and size
export interface DoorRelief extends PlanTones {
  corner: [number, number];
  size: [number, number];
}
