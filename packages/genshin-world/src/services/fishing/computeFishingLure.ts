import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { GroundPoint } from "genshin-engine";

// The lure's point while a line is out, which the rod is held toward and the float rests on. Once the line is reeled in
// Nothing is out, so there is no lure and no rod or float to draw
export const computeFishingLure = ({
  isLineOut,
  point,
}: {
  isLineOut: boolean;
  point?: FishingPointPlace | undefined;
}): GroundPoint | undefined => (isLineOut ? point?.position : undefined);
