import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The layout pass's gate: each fitted part within this many metres of the exports' object it stands for, twice the
// Centimetre the fitted data is written to
export const LAYOUT_GATE_METRES = 0.02;
// The camera pass's gate: a reference's landmarks within this many of its own pixels, root mean square, of where the
// Scene's camera projects them, a 1080-line recording's edges softening over about two
export const CAMERA_GATE_PIXELS = 2;
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
