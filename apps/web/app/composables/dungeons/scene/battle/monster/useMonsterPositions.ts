import type { Position } from "grid-engine";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

// The player and the enemy hold the same four values against different starting points: each side slides its
// Monster and its info container in from off-screen, and returns to the initial position on unmount
export const useMonsterPositions = (
  initialMonsterPosition: Position,
  initialMonsterInfoContainerPosition: Position,
) => {
  const frozenInitialMonsterPosition = Object.freeze(initialMonsterPosition);
  const frozenInitialMonsterInfoContainerPosition = Object.freeze(initialMonsterInfoContainerPosition);
  const monsterPosition = ref(structuredClone<Position>(frozenInitialMonsterPosition));
  const monsterTween = ref<TweenBuilderConfiguration>();
  const monsterInfoContainerPosition = ref(structuredClone<Position>(frozenInitialMonsterInfoContainerPosition));
  const monsterInfoContainerTween = ref<TweenBuilderConfiguration>();
  return {
    initialMonsterInfoContainerPosition: frozenInitialMonsterInfoContainerPosition,
    initialMonsterPosition: frozenInitialMonsterPosition,
    monsterInfoContainerPosition,
    monsterInfoContainerTween,
    monsterPosition,
    monsterTween,
  };
};
