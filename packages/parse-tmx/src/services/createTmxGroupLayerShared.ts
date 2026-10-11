import type { TMXGroupLayerShared } from "#src/models/tmx/shared/TMXGroupLayerShared";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";

import { parseNumberAttribute } from "#src/services/parseNumberAttribute";
import { withoutUndefined } from "#src/services/withoutUndefined";

// The attributes every layer and group carries, with the element's own tag as its type
export const createTmxGroupLayerShared = (type: string, attributes: TMXAttributes): TMXGroupLayerShared =>
  withoutUndefined({
    class: attributes.class,
    id: parseNumberAttribute(attributes.id) ?? 0,
    name: attributes.name ?? "",
    offsetx: parseNumberAttribute(attributes.offsetx),
    offsety: parseNumberAttribute(attributes.offsety),
    opacity: parseNumberAttribute(attributes.opacity),
    parallaxx: parseNumberAttribute(attributes.parallaxx),
    parallaxy: parseNumberAttribute(attributes.parallaxy),
    tintcolor: attributes.tintcolor,
    type,
    visible: parseNumberAttribute(attributes.visible),
  });
