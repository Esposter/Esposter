import {
  LOGIN_WALKWAY_RISE_DEPTH,
  LOGIN_WALKWAY_RISE_OVERSHOOT,
  LOGIN_WALKWAY_RISE_STAGGER,
  LOGIN_WALKWAY_SETTLED_DISTANCE,
  LOGIN_WALKWAY_SUNK_DISTANCE,
} from "#src/services/login/walkway/constants";
import { MathUtils } from "three";

// The back-out ease's tension whose peak carries a piece the overshoot past its place: an ease of tension s peaks at
// 1 + 4s³ / 27(s + 1)² of its travel, which only grows with s, so the tension is found by halving
const solveTension = (peak: number): number => {
  let [low, high] = [0, 10];
  for (let step = 0; step < 50; step++) {
    const middle = (low + high) / 2;
    if ((4 * middle ** 3) / (27 * (middle + 1) ** 2) < peak) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
};
const TENSION = solveTension(LOGIN_WALKWAY_RISE_OVERSHOOT / LOGIN_WALKWAY_RISE_DEPTH);
// How far under its place a walkway piece stands, in metres, by how far ahead of the camera its middle is and its
// Seed, the span shifted piece by piece by up to the stagger so the walkway's far end assembles block by block: all
// The way down at the sunk distance, rising past its place by the overshoot and settling back by the settled one, a
// Negative sink standing over its place
export const readLoginWalkwaySink = (ahead: number, seed: number): number => {
  const progress = MathUtils.clamp(
    (LOGIN_WALKWAY_SUNK_DISTANCE - ahead - (seed - 0.5) * LOGIN_WALKWAY_RISE_STAGGER) /
      (LOGIN_WALKWAY_SUNK_DISTANCE - LOGIN_WALKWAY_SETTLED_DISTANCE),
    0,
    1,
  );
  const remaining = progress - 1;
  const rise = 1 + (TENSION + 1) * remaining ** 3 + TENSION * remaining ** 2;
  return LOGIN_WALKWAY_RISE_DEPTH * (1 - rise);
};
