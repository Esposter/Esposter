import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { parseNumberAttribute } from "#src/services/parseNumberAttribute";
import { withoutUndefined } from "#src/services/withoutUndefined";

export const createTmxImage = (attributes: TMXAttributes): TMXImageParsed =>
  withoutUndefined({
    format: attributes.format,
    height: parseNumberAttribute(attributes.height) ?? 0,
    source: attributes.source ?? "",
    trans: attributes.trans,
    width: parseNumberAttribute(attributes.width) ?? 0,
  });
