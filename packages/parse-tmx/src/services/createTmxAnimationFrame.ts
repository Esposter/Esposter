import type { TMXAnimationFrameParsed } from "#src/models/tmx/parsed/TMXAnimationFrameParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { parseNumberAttribute } from "#src/services/parseNumberAttribute";

export const createTmxAnimationFrame = (attributes: TMXAttributes): TMXAnimationFrameParsed => ({
  duration: parseNumberAttribute(attributes.duration) ?? 0,
  tileid: parseNumberAttribute(attributes.tileid) ?? 0,
});
