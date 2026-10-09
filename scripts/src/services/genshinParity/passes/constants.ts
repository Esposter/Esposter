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
// The gate a landmark's root is held to, the scene's where it stands against its export's, both in metres: a fifth of
// The 0.97 metres a hand offset once stood the statue under its export's root, which read as most of its outline
export const LANDMARK_ROOT_GATE_METRES = 0.05;
// The gate a place on the frame is held to, in a reference's own pixels, a 1080-line recording's edges softening over
// About two: the layout pass's each fitted part from the export it stands for, both projected at the reference's
// Camera; the camera pass's landmarks, root mean square, from where the scene's camera projects them (a reference's own
// Pose bar where it sets one, `getPoseBar`); and the light pass's shadows' edges from the reference's, on average both
// Ways; and the glow's structure, the reference's frame moved across by the same
export const FRAME_GATE_PIXELS = 2;
// The width the shape pass draws ours and the exports' at, wide enough that a stand-in's outline a pixel off shows,
// And its gates: the outlines a pixel apart on average, which the exports' own edges rasterise within, the depth a
// Hundredth off, and the normals ten degrees, where a toon ramp's light barely moves
export const SHAPE_WIDTH = 1280;
export const SHAPE_OUTLINE_GATE_PIXELS = 1;
export const SHAPE_DEPTH_GATE = 0.01;
export const SHAPE_NORMAL_GATE_DEGREES = 10;
// The square of a block a family's pixels are split into two halves by, as a chequerboard, so each half spreads over the
// Whole surface: the two halves read against each other are the floor a statistic matched in distribution is gated at
export const SPLIT_BLOCK_PIXELS = 32;
// The gate a mean colour is held to, a surface's unlit or glow or the clear sky's: within the CIELab distance two colours
// Side by side are just told apart at
export const COLOUR_GATE = 2.3;
// The display pass reads at this width, and holds the shipped tone contrast to leaving at most this share more of its
// Light off the plane than the contrast that leaves least: on the login the profile's 0.5 leaves a few hundredths
// More, and its next value, 0.75, about seven tenths
export const DISPLAY_WIDTH = 640;
export const DISPLAY_CONTRAST_GATE = 0.1;
// The light pass reads a reference's shadows at this width, where its gate, two of a 1080-line recording's pixels,
// Spans more than one
export const SHADOW_WIDTH = 1280;
// The atmosphere pass's chequerboards a reference's sky is split in two by, blocks this many pixels across at the
// Clouds' width: from about a cloud's tuft to about a third of the frame's height, where a half still holds sky from
// Every height over the horizon
export const ATMOSPHERE_SPLIT_BLOCK_SIZES: readonly number[] = [32, 64, 128];
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
