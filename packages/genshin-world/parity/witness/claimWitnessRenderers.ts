import type { ScreenFixture } from "#parity/models/ScreenFixture";
import type { WitnessClaim } from "#parity/models/witness/WitnessClaim";
import type { SceneLayout } from "genshin-engine";

const findClaim = (claims: readonly [string, RegExp][], renderer: string): string | undefined =>
  claims.find(([, regex]) => regex.test(renderer))?.[0];
// Each renderer of a scene's exports, once however many placements draw it, with what of the scene claims it: the
// Inventory pass's measure, which holds once nothing goes unclaimed
export const claimWitnessRenderers = (
  { placements }: SceneLayout,
  {
    witnessFamilies = {},
    witnessStandIns = {},
    witnessUndrawn = {},
  }: Pick<ScreenFixture, "witnessFamilies" | "witnessStandIns" | "witnessUndrawn">,
): WitnessClaim[] => {
  const drawnClaims = [...Object.entries(witnessFamilies), ...Object.entries(witnessStandIns)];
  const undrawnClaims = Object.entries(witnessUndrawn);
  const renderers = new Set(placements.map(({ materials, mesh }) => [mesh, ...materials].join(" ")));
  return [...renderers].map((renderer) => {
    const drawnClaim = findClaim(drawnClaims, renderer);
    if (drawnClaim) return { claim: drawnClaim, isDrawn: true, renderer };
    return { claim: findClaim(undrawnClaims, renderer) ?? "", isDrawn: false, renderer };
  });
};
