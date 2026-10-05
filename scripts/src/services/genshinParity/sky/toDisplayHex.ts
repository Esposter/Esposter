import type { Vector } from "#src/models/shared/Vector";

import { toneMapNeutral } from "genshin-engine";
import { Color } from "three";

// A solved scene colour as the display colour a sky state holds it as, which the scene inverts back on applying it,
// Each channel held at none or more
export const toDisplayHex = ([red, green, blue]: Vector): string =>
  `#${new Color(...toneMapNeutral([Math.max(red, 0), Math.max(green, 0), Math.max(blue, 0)])).getHexString()}`;
