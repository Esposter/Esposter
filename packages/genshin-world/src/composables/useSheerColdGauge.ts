import type { Catalogue } from "#src/models/world/Catalogue";
import type { LocomotionPhase, WeatherKind } from "genshin-engine";
import type { Object3D } from "three";

import { useSheerCold } from "#src/composables/useSheerCold";

interface SheerColdGaugeOptions {
  catalogue: Catalogue;
  // The ratio of anti-cold the character on the field holds the gauge's fill down with
  getAntiColdRatio: () => number;
  // The character on the field, whose maximum health and locomotion phase the gauge reads, undefined before it has loaded
  getCharacter: () => undefined | { maxHealth: number; phase: LocomotionPhase };
  // The character's body, whose position the gauge is read at, undefined until the body is given
  getCharacterBody: () => Object3D | undefined;
  // The weather of the area the camera stands in
  getWeather: () => WeatherKind;
  // The damage of each interval once the gauge is full
  onColdDamage: (damage: number) => void;
  // The gauge's value, emitted each time it changes
  onSheerCold: (value: number) => void;
}

// The Sheer Cold gauge of the character on the field, which the HUD reads from the value emitted each change. No campfire
// Is placed in the world yet, so no heat source drains it
export const useSheerColdGauge = ({
  catalogue,
  getAntiColdRatio,
  getCharacter,
  getCharacterBody,
  getWeather,
  onColdDamage,
  onSheerCold,
}: SheerColdGaugeOptions) => {
  const sheerCold = useSheerCold(
    catalogue,
    () => {
      const character = getCharacter();
      const characterBody = getCharacterBody();
      return characterBody && character ? { ...character, position: characterBody.position } : undefined;
    },
    () => [],
    getAntiColdRatio,
    getWeather,
    onColdDamage,
  );
  watch(sheerCold, (value) => {
    onSheerCold(value);
  });
};
