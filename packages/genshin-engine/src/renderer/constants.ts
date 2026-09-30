import type { ToneMapping } from "three";

import { NeutralToneMapping } from "three";

// The neutral tone mapping keeps each hue where the palette put it, which a filmic curve would shift, and it is what
// `toSceneColor` inverts. A TresJS canvas sets its own (ACES filmic unless told) over the renderer's, so every canvas
// Passes this one
export const GENSHIN_TONE_MAPPING: ToneMapping = NeutralToneMapping;
