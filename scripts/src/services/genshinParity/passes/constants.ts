import { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The passes in the order they run, each after every pass it depends on
export const PARITY_PASS_ORDER: readonly ParityPass[] = [
  ParityPass.Inventory,
  ParityPass.Layout,
  ParityPass.Camera,
  ParityPass.Shape,
  ParityPass.Motion,
  ParityPass.Surface,
  ParityPass.Display,
  ParityPass.Light,
  ParityPass.Atmosphere,
  ParityPass.Audio,
];
// The gate a part's place is held to, still or moving: the layout pass's fitted part within this many metres of the
// Exports' object it stands for, and the motion pass's piece of where its clip carries it, twice the centimetre the
// Fitted data is written to
export const PART_GATE_METRES = 0.02;
// The camera pass's gate: a reference's landmarks within this many of its own pixels, root mean square, of where the
// Scene's camera projects them, a 1080-line recording's edges softening over about two
export const CAMERA_GATE_PIXELS = 2;
// The width the shape pass draws ours and the exports' at, wide enough that a stand-in's outline a pixel off shows,
// And its gates: the outlines a pixel apart on average, which the exports' own edges rasterise within, the depth a
// Hundredth off, and the normals ten degrees, where a toon ramp's light barely moves
export const SHAPE_WIDTH = 1280;
export const SHAPE_OUTLINE_GATE_PIXELS = 1;
export const SHAPE_DEPTH_GATE = 0.01;
export const SHAPE_NORMAL_GATE_DEGREES = 10;
// The motion pass's clip played within a hundredth of its pace, about a frame over the door's lift; a frame's moment
// Along its clip refined in steps of a quarter of a millisecond, which a piece rising at metres a second moves a few
// Millimetres in; and the size it draws the scene at, which none of its readings depend on
export const MOTION_PACE_GATE = 0.01;
export const MOTION_STEP_MS = 0.25;
export const MOTION_WIDTH = 640;
export const MOTION_HEIGHT = 360;
// The committed report of each component's last run of its passes
export const PARITY_PASSES_PATH: string = join(
  REPOSITORY_ROOT,
  "scripts",
  "src",
  "services",
  "genshinParity",
  "passes",
  "ParityPasses.snapshot.md",
);
