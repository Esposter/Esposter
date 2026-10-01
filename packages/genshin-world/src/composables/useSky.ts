import type { SkyOptions } from "#src/models/SkyOptions";
import type { GameClock } from "genshin-engine";

import { CLOUD_DRIFT_PER_WIND } from "#src/services/constants";
import { useLoop, useTres } from "@tresjs/core";
import {
  advanceGameClock,
  applySkyState,
  createSkyGradientTexture,
  createSkyNode,
  createSkyState,
  DEFAULT_SKY_GRADIENT,
  GAME_MINUTES_PER_SECOND,
  sampleSkyState,
} from "genshin-engine";

// The sky as the scene's background, and the game's clock running under it: every frame the day moves on by the
// Frame's time, the keyframes are sampled at the new minute, and the result is written into everything the sky
// Lights, and the clouds drift with the wind. The clock is handed back for the tuning panel and the clock control to
// Set
export const useSky = ({ skyKeyframes, skyTargets, startMinutes, tilt, windUniforms }: SkyOptions): GameClock => {
  const { scene } = useTres();
  const { onBeforeRender } = useLoop();
  const gameClock: GameClock = { minutes: startMinutes, minutesPerSecond: GAME_MINUTES_PER_SECOND };
  const skyState = createSkyState();
  const { cloudDrift } = skyTargets.skyUniforms;
  const writeSky = () => {
    sampleSkyState(skyKeyframes, gameClock.minutes, tilt, skyState);
    applySkyState(skyState, skyTargets);
  };
  // A region's sky has no gradient of its own, so it falls from its horizon's colour to its zenith's in a smoothstep
  const gradient = createSkyGradientTexture(DEFAULT_SKY_GRADIENT);
  scene.value.backgroundNode = createSkyNode(skyTargets.skyUniforms, gradient);
  writeSky();

  onBeforeRender(({ delta }) => {
    advanceGameClock(gameClock, delta);
    cloudDrift.value.addScaledVector(
      windUniforms.direction.value,
      windUniforms.strength.value * CLOUD_DRIFT_PER_WIND * delta,
    );
    writeSky();
  });

  onUnmounted(() => {
    scene.value.backgroundNode = null;
    gradient.dispose();
  });

  return gameClock;
};
