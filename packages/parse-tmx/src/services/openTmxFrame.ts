import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxExport } from "#src/services/createTmxExport";
import { openTmxAnimationFrame, openTmxTileChild } from "#src/services/openTmxTileChild";
import { openTmxDataChild } from "#src/services/openTmxDataChild";
import { openTmxLayerChild } from "#src/services/openTmxLayerChild";
import { openTmxMapChild } from "#src/services/openTmxMapChild";
import { openTmxNestedProperties, openTmxPropertyChild } from "#src/services/openTmxPropertyChild";
import { openTmxObjectChild } from "#src/services/openTmxObjectChild";
import { openTmxTilesetChild } from "#src/services/openTmxTilesetChild";
import { parseTmxTagName } from "#src/services/parseTmxTagName";

// Opens an element inside a parent the reader models. An element the parent does not model is undefined, which keeps
// Its subtree unread.
export const openTmxFrame = (
  parent: TMXFrame,
  name: string,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame | undefined => {
  const tag = parseTmxTagName(name);
  switch (parent.tag) {
    case TMXTagName.Map:
      return openTmxMapChild(parent, name, tag, attributes);
    case TMXTagName.EditorSettings:
      if (tag !== TMXTagName.Export) return undefined;
      parent.target.export = createTmxExport(attributes);
      return { tag, target: parent.target.export, text: "" };
    case TMXTagName.Animation:
      return openTmxAnimationFrame(parent, tag, attributes);
    case TMXTagName.Chunk:
    case TMXTagName.Data:
      return openTmxDataChild(parent, tag, attributes, context);
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
      return openTmxLayerChild(parent, tag, attributes, context);
    case TMXTagName.Objectgroup:
    case TMXTagName.Object:
      return openTmxObjectChild(parent, tag, attributes);
    case TMXTagName.Property:
      return openTmxNestedProperties(parent, tag);
    case TMXTagName.Properties:
      return openTmxPropertyChild(parent, tag, attributes);
    case TMXTagName.Tile:
      return openTmxTileChild(parent, tag, attributes);
    case TMXTagName.Tileset:
      return openTmxTilesetChild(parent, tag, attributes);
    default:
      return undefined;
  }
};
