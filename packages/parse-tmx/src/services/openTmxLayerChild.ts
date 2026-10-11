import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxImage } from "#src/services/createTmxImage";
import { openTmxLayer } from "#src/services/openTmxLayer";
import { openTmxProperties } from "#src/services/openTmxProperties";
import { openTmxTileData } from "#src/services/openTmxTileData";

type TMXLayerChildParent = Extract<TMXFrame, { tag: TMXTagName.Group | TMXTagName.ImageLayer | TMXTagName.Layer }>;

// A group holds layers, an image layer its image and a tile layer its data, and each holds its properties
export const openTmxLayerChild = (
  parent: TMXLayerChildParent,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame | undefined => {
  switch (tag) {
    case TMXTagName.Properties:
      return openTmxProperties(parent.target);
    case TMXTagName.Data:
      if (parent.tag !== TMXTagName.Layer) return undefined;
      return openTmxTileData(parent.target, attributes, context);
    case TMXTagName.Image:
      if (parent.tag !== TMXTagName.ImageLayer) return undefined;
      parent.target.image = createTmxImage(attributes);
      return { tag, target: parent.target.image, text: "" };
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
    case TMXTagName.Objectgroup:
      if (parent.tag !== TMXTagName.Group) return undefined;
      return openTmxLayer(parent.target.layers, tag, attributes);
    default:
      return undefined;
  }
};
