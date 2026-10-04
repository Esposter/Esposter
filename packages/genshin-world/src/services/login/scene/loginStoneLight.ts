import type { StoneLightUniforms } from "genshin-engine";

import { createStoneLightUniforms } from "genshin-engine";

// The login's stone light, one set for the screen: the scene writes each hour's into it, and the parity page's witness
// Lights the game's exports from it, so a stand-in and its export are drawn under the one light. Only one login scene
// Stands at a time, so the set is the module's rather than each mounted scene's
export const loginStoneLight: StoneLightUniforms = createStoneLightUniforms();
