import { MmdBoneName } from "#src/models/character/MmdBoneName";
import { LocomotionState } from "#src/models/locomotion/LocomotionState";

// The seconds one breath takes, and how far the chest and the shoulders lift on it, in radians
// Provisional: read off a wiki frame of a standing character's idle, which no capture of the Traveler's yet holds
export const POSE_BREATH_SECONDS = 4;
export const POSE_CHEST_BREATH_RADIANS = 0.02;
export const POSE_SHOULDER_BREATH_RADIANS = 0.02;
// How far the arms come down from the T, in radians from horizontal: the relaxed idle, with the arms out a little
// Provisional: read off the same wiki frame, since neither reference holds the Traveler's relaxed stance cleanly
export const POSE_ARM_LOWER_RADIANS = 1.2;
// How far the elbows bend in a state with no gait, in radians
// Provisional: a stance's elbow is read off the same wiki frame as the arms, not yet off the game's clips
export const POSE_ARM_BEND_RADIANS = 0.2;
// How many seconds a state's pose takes to cross-fade from the one before it
export const POSE_CROSSFADE_SECONDS = 0.25;
// The gaits: how far one full stride covers in metres, which sets its frequency from the state's speed, and how far its
// Legs, knees, arms and elbows swing, in radians
// Provisional: the strides and swings are read from a walk, a run and a sprint, not yet off the game's clips
export interface PoseGait {
  armBendRadians: number;
  armSwingRadians: number;
  kneeBendRadians: number;
  leanRadians: number;
  legSwingRadians: number;
  strideMetres: number;
}
const SPRINT_GAIT: PoseGait = {
  armBendRadians: 1.1,
  armSwingRadians: 0.9,
  kneeBendRadians: 1.1,
  leanRadians: 0.2,
  legSwingRadians: 0.9,
  strideMetres: 3.2,
};
// A dash runs on the sprint's gait, at its own speed
export const POSE_GAITS: Partial<Record<LocomotionState, PoseGait>> = {
  [LocomotionState.Dash]: SPRINT_GAIT,
  [LocomotionState.Run]: {
    armBendRadians: 0.9,
    armSwingRadians: 0.7,
    kneeBendRadians: 0.9,
    leanRadians: 0.12,
    legSwingRadians: 0.7,
    strideMetres: 2.6,
  },
  [LocomotionState.Sprint]: SPRINT_GAIT,
  [LocomotionState.Walk]: {
    armBendRadians: 0.3,
    armSwingRadians: 0.3,
    kneeBendRadians: 0.4,
    leanRadians: 0,
    legSwingRadians: 0.35,
    strideMetres: 1.2,
  },
};
// The airborne poses, each a fixed stance: how far the arms are lowered, how far the body leans forward and how much
// The knees bend. A glide spreads its arms wide and leans into the glider
export interface PoseAirStance {
  armLowerRadians: number;
  kneeBendRadians: number;
  leanRadians: number;
}
export const POSE_AIR_STANCES: Partial<Record<LocomotionState, PoseAirStance>> = {
  [LocomotionState.Fall]: { armLowerRadians: 1.3, kneeBendRadians: 0.2, leanRadians: 0 },
  [LocomotionState.Glide]: { armLowerRadians: 0.3, kneeBendRadians: 0, leanRadians: 0.3 },
  [LocomotionState.Jump]: { armLowerRadians: 0.9, kneeBendRadians: 0.3, leanRadians: 0.05 },
  [LocomotionState.Plunge]: { armLowerRadians: 0.5, kneeBendRadians: 0, leanRadians: 0.6 },
};
// The model's bone names when it is a PMX model, which holds each standard bone under its MMD name
export const MMD_BONE_NAME_MAP: Record<MmdBoneName, string> = Object.fromEntries(
  Object.values(MmdBoneName).map((name) => [name, name]),
);
