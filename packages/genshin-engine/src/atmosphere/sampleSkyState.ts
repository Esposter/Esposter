import type { SkyKeyframe } from "#src/atmosphere/SkyKeyframe";
import type { SkyState } from "#src/atmosphere/SkyState";

import { computeSunDirection } from "#src/atmosphere/computeSunDirection";
import { MINUTES_PER_DAY } from "#src/clock/constants";

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;
// The sky at a minute of the day, blended linearly between the keyframes either side of it and wrapping through
// Midnight from the last keyframe to the first. The keyframes are in order of their minutes. Written into the state
// It is given, so a frame allocates nothing
export const sampleSkyState = (
  skyKeyframes: readonly SkyKeyframe[],
  minutes: number,
  tilt: number,
  skyState: SkyState,
): SkyState => {
  // A loop rather than a search with a callback, which would allocate a closure every frame
  let nextIndex = 0;
  while (nextIndex < skyKeyframes.length && (skyKeyframes[nextIndex]?.minutes ?? 0) <= minutes) nextIndex++;
  if (nextIndex === skyKeyframes.length) nextIndex = 0;
  const previous = skyKeyframes.at(nextIndex - 1) ?? skyKeyframes[nextIndex];
  const next = skyKeyframes[nextIndex];
  if (!previous || !next) return skyState;
  const span = (next.minutes - previous.minutes + MINUTES_PER_DAY) % MINUTES_PER_DAY || MINUTES_PER_DAY;
  const amount = ((minutes - previous.minutes + MINUTES_PER_DAY) % MINUTES_PER_DAY) / span;
  skyState.cloudLitColor.lerpColors(previous.cloudLitColor, next.cloudLitColor, amount);
  skyState.cloudShadeColor.lerpColors(previous.cloudShadeColor, next.cloudShadeColor, amount);
  skyState.hemisphereGroundColor.lerpColors(previous.hemisphereGroundColor, next.hemisphereGroundColor, amount);
  skyState.hemisphereIntensity = lerp(previous.hemisphereIntensity, next.hemisphereIntensity, amount);
  skyState.hemisphereSkyColor.lerpColors(previous.hemisphereSkyColor, next.hemisphereSkyColor, amount);
  skyState.horizonColor.lerpColors(previous.horizonColor, next.horizonColor, amount);
  skyState.lightColor.lerpColors(previous.lightColor, next.lightColor, amount);
  skyState.lightIntensity = lerp(previous.lightIntensity, next.lightIntensity, amount);
  skyState.starIntensity = lerp(previous.starIntensity, next.starIntensity, amount);
  skyState.zenithColor.lerpColors(previous.zenithColor, next.zenithColor, amount);
  computeSunDirection(minutes, tilt, skyState.sunDirection);
  skyState.moonDirection.copy(skyState.sunDirection).negate();
  skyState.lightDirection.copy(skyState.sunDirection.y >= 0 ? skyState.sunDirection : skyState.moonDirection);
  return skyState;
};
