import { getUnattributedPresses } from "#src/services/sweeps/hoverGuard/getUnattributedPresses";
import { readStyleFindings } from "#src/services/sweeps/hoverGuard/readStyleFindings";

// One `path:line: selector` per press rule of the Genshin stylesheets that names `:active` and not `[data-pressed]`
export const readUnattributedPressFindings = (): string[] => readStyleFindings(getUnattributedPresses);
