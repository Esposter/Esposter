import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxGroup } from "#src/services/createTmxGroup";
import { createTmxLayer } from "#src/services/createTmxLayer";

// A layer or group joins the list its parent keeps, in the order the document gives them, which is the draw order
export const openTmxLayer = (
  layers: (TMXGroupLayerParsed | TMXLayerParsed)[],
  tag: TMXTagName.Group | TMXTagName.ImageLayer | TMXTagName.Layer | TMXTagName.Objectgroup,
  attributes: TMXAttributes,
): TMXFrame => {
  if (tag === TMXTagName.Group) {
    const group = createTmxGroup(attributes);
    layers.push(group);
    return { tag, target: group, text: "" };
  }

  const layer = createTmxLayer(tag, attributes);
  layers.push(layer);
  return { tag, target: layer, text: "" };
};
