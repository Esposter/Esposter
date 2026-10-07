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
// The layout pass's gate: each fitted part within this many metres of the exports' object it stands for, twice the
// Centimetre the fitted data is written to
export const LAYOUT_GATE_METRES = 0.02;
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
