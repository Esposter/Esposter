import type { KitContext } from "#src/models/kit/KitContext";

import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";

// Whether the team is at Ascendant Gleam, the level its Moonsign benedictions make, which a kit's extra hits and effects read
export const isAscendantGleam = ({ characterIdCombatantMap, party }: KitContext): boolean =>
  getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam;
