import type { HeatSource } from "#src/models/sheerCold/HeatSource";
import type { SheerCold } from "#src/models/sheerCold/SheerCold";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { LocomotionPhase } from "genshin-engine";

import { REGION_RECHECK_DISTANCE } from "#src/services/constants";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { checkIsHeatedBy } from "#src/services/sheerCold/checkIsHeatedBy";
import { checkIsSheerColdArea } from "#src/services/sheerCold/checkIsSheerColdArea";
import { stepSheerCold } from "#src/services/sheerCold/stepSheerCold";
import { useLoop } from "@tresjs/core";
import { LocomotionState, WeatherKind } from "genshin-engine";

interface SheerColdCharacter {
  maxHealth: number;
  phase: LocomotionPhase;
  position: { x: number; z: number };
}

// The Sheer Cold gauge of the character, stepped each frame: the subzero climate of the area the character stands in
// Fills it, a lit heat source near it drains it wherever it stands, and swimming or a snowstorm fills it faster, and an anti-cold
// Holds the fill down. Full, it hands each
// Interval's damage to onDamage. The area is rechecked only once the character has moved a stretch, as an
// Area's weather is. The gauge's value is returned
export const useSheerCold = (
  catalogue: Catalogue,
  getCharacter: () => SheerColdCharacter | undefined,
  getHeatSources: () => readonly HeatSource[],
  getAntiColdRatio: () => number,
  getWeather: () => WeatherKind,
  onDamage: (damage: number) => void,
) => {
  const { onBeforeRender } = useLoop();
  const value = shallowRef(0);
  const sheerCold: SheerCold = { damageSeconds: 0, value: 0 };
  let checkedX = Infinity;
  let checkedZ = Infinity;
  let isInCold = false;

  onBeforeRender(({ delta }) => {
    const character = getCharacter();
    if (!character) return;
    const {
      maxHealth,
      phase,
      position: { x, z },
    } = character;
    if (Math.hypot(x - checkedX, z - checkedZ) >= REGION_RECHECK_DISTANCE) {
      checkedX = x;
      checkedZ = z;
      isInCold = checkIsSheerColdArea(findAreaAt(catalogue, x, z));
    }
    const isSwimming = phase.state === LocomotionState.Swim || phase.state === LocomotionState.SwimDash;
    const damage = stepSheerCold(
      sheerCold,
      {
        antiColdRatio: getAntiColdRatio(),
        isHeated: checkIsHeatedBy(x, z, getHeatSources()),
        isInCold,
        isSnowstorm: getWeather() === WeatherKind.Snowstorm,
        isSwimming,
        maxHealth,
      },
      delta,
    );
    if (damage > 0) onDamage(damage);
    value.value = sheerCold.value;
  });

  return value;
};
