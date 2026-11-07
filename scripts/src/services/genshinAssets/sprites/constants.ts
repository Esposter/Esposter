import { REFERENCE_SCRATCH_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// The sprites and textures the command exports by their exact names, each a PNG under its name, kept outside the
// Repository like every other export and never shipped
export const SPRITE_DIRECTORY: string = join(REFERENCE_SCRATCH_DIRECTORY, "sprites");
// Where a run keeps each sprite's dump and the atlases it cuts from, cleared at the start of every run
export const SPRITE_WORK_DIRECTORY: string = join(REFERENCE_SCRATCH_DIRECTORY, "sprite-work");
export const SPRITE_DUMP_DIRECTORY: string = join(SPRITE_WORK_DIRECTORY, "dumps");
export const SPRITE_ATLAS_DIRECTORY: string = join(SPRITE_WORK_DIRECTORY, "atlases");
