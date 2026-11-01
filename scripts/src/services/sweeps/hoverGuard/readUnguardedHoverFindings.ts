import { getUnguardedHovers } from "#src/services/sweeps/hoverGuard/getUnguardedHovers";
import { readStyleFindings } from "#src/services/sweeps/hoverGuard/readStyleFindings";

// One `path:line: selector` per hover rule of the Genshin stylesheets outside the hover media query
export const readUnguardedHoverFindings = (): string[] => readStyleFindings(getUnguardedHovers);
