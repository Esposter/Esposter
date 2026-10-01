import {
  LOGIN_WALKWAY_RISE_DEPTH,
  LOGIN_WALKWAY_RISE_STAGGER,
  LOGIN_WALKWAY_SETTLED_DISTANCE,
  LOGIN_WALKWAY_SUNK_DISTANCE,
} from "#src/services/login/walkway/constants";
import { MathUtils } from "three";

// How far under its place a walkway piece stands, in metres, by how far ahead of the camera its middle is and its
// Seed: in place until the settled distance, all the way down past the sunk one, easing between, the span shifted
// Piece by piece by up to the stagger so the walkway's far end assembles block by block
export const readLoginWalkwaySink = (ahead: number, seed: number): number =>
  LOGIN_WALKWAY_RISE_DEPTH *
  MathUtils.smoothstep(
    ahead + (seed - 0.5) * LOGIN_WALKWAY_RISE_STAGGER,
    LOGIN_WALKWAY_SETTLED_DISTANCE,
    LOGIN_WALKWAY_SUNK_DISTANCE,
  );
