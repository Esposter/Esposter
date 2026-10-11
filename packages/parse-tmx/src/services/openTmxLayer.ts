import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { AttributeKind } from "#src/models/AttributeKind";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { readTmxAttributes } from "#src/services/readTmxAttributes";

const groupAttributeKindMap = {
  class: AttributeKind.String,
  id: AttributeKind.RequiredNumber,
  name: AttributeKind.RequiredString,
  offsetx: AttributeKind.Number,
  offsety: AttributeKind.Number,
  opacity: AttributeKind.Number,
  parallaxx: AttributeKind.Number,
  parallaxy: AttributeKind.Number,
  tintcolor: AttributeKind.String,
  visible: AttributeKind.Number,
} as const;
const layerAttributeKindMap = {
  ...groupAttributeKindMap,
  color: AttributeKind.String,
  draworder: AttributeKind.String,
  height: AttributeKind.Number,
  locked: AttributeKind.Number,
  width: AttributeKind.Number,
  x: AttributeKind.Number,
  y: AttributeKind.Number,
} as const;

// A layer or group joins the list its parent keeps, in the order the document gives them, which is the draw order
export const openTmxLayer = (
  layers: (TMXGroupLayerParsed | TMXLayerParsed)[],
  tag: TMXTagName.Group | TMXTagName.ImageLayer | TMXTagName.Layer | TMXTagName.Objectgroup,
  attributes: TMXAttributes,
): TMXFrame => {
  if (tag === TMXTagName.Group) {
    const group: TMXGroupLayerParsed = {
      ...readTmxAttributes(attributes, groupAttributeKindMap),
      layers: [],
      type: tag,
    };
    layers.push(group);
    return { tag, target: group, text: "" };
  }

  const layer: TMXLayerParsed = { ...readTmxAttributes(attributes, layerAttributeKindMap), type: tag };
  layers.push(layer);
  return { tag, target: layer, text: "" };
};
