import type { Vector } from "#src/models/shared/Vector";

import { toneMapGenshin } from "genshin-engine";
import { Color } from "three";

// A solved scene colour as the display colour a sky state holds it as, which the scene inverts back on applying it
export const toDisplayHex = (sceneColor: Vector): string =>
  `#${new Color(...toneMapGenshin(sceneColor)).getHexString()}`;
