import type { GroundPoint } from "genshin-engine";

import { checkIsArchitectureName } from "#src/services/genshinAssets/world/checkIsArchitectureName";
import { checkIsInArchitectureView } from "#src/services/genshinAssets/world/checkIsInArchitectureView";

// The named objects a capital's architecture view keeps: each built by a building family and standing within the
// Architecture radius of the capital's place. Decoration and any object past the radius are left out
export const selectArchitectureInView = <T extends { name: string; position: readonly [number, number, number] }>(
  objects: readonly T[],
  place: GroundPoint,
): T[] =>
  objects.filter(({ name, position }) => checkIsArchitectureName(name) && checkIsInArchitectureView(position, place));
