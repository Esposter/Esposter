import type { LatheSection } from "#src/kits/architecture/LatheSection";

export interface LatheStackOptions {
  // Flat faces between the sides, as a cut stone shaft has, rather than a round one's smooth shading
  isFaceted: boolean;
  radialSegments: number;
  // From the foot up, each standing on the one before
  sections: LatheSection[];
}
