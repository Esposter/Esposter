import type { TMXAttributes } from "#src/internal/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/internal/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/internal/models/tmx/TMXReadContext";

import { TMXTagName } from "#src/internal/models/tmx/TMXTagName";
import { createTmxImage } from "#src/internal/services/createTmxImage";
import { openTileData } from "#src/internal/services/openTileData";
import { openTmxDataChild } from "#src/internal/services/openTmxDataChild";
import { openTmxLayer } from "#src/internal/services/openTmxLayer";
import { openTmxProperties } from "#src/internal/services/openTmxProperties";

type TMXLayerChildParent = Extract<
  TMXFrame,
  {
    tag:
      | typeof TMXTagName.Chunk
      | typeof TMXTagName.Data
      | typeof TMXTagName.Group
      | typeof TMXTagName.ImageLayer
      | typeof TMXTagName.Layer;
  }
>;

// A group holds layers, an image layer its image and a tile layer its data, and each holds its properties
export const openTmxLayerChild = (
  parent: TMXLayerChildParent,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame | undefined => {
  if (parent.tag === TMXTagName.Chunk || parent.tag === TMXTagName.Data)
    return openTmxDataChild(parent, tag, attributes, context);

  switch (tag) {
    case TMXTagName.Data:
      if (parent.tag === TMXTagName.Layer) return openTileData(parent.target, attributes, context);
      else return undefined;
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
    case TMXTagName.Objectgroup:
      if (parent.tag === TMXTagName.Group) return openTmxLayer(parent.target.layers, tag, attributes);
      else return undefined;
    case TMXTagName.Image:
      if (parent.tag !== TMXTagName.ImageLayer) return undefined;
      parent.target.image = createTmxImage(attributes);
      return { tag, target: parent.target.image, text: "" };
    case TMXTagName.Properties:
      return openTmxProperties(parent.target);
    default:
      return undefined;
  }
};
