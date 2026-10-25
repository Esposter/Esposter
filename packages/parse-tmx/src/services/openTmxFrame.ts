import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { AttributeKind } from "#src/models/AttributeKind";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { openTmxLayerChild } from "#src/services/openTmxLayerChild";
import { openTmxMapChild } from "#src/services/openTmxMapChild";
import { openTmxObjectChild } from "#src/services/openTmxObjectChild";
import { openTmxProperties } from "#src/services/openTmxProperties";
import { openTmxPropertyChild } from "#src/services/openTmxPropertyChild";
import { openTmxRoot } from "#src/services/openTmxRoot";
import { openTmxTileChild } from "#src/services/openTmxTileChild";
import { openTmxTilesetChild } from "#src/services/openTmxTilesetChild";
import { parseTmxTagName } from "#src/services/parseTmxTagName";
import { readTmxAttributes } from "#src/services/readTmxAttributes";

const animationFrameAttributeKindMap = {
  duration: AttributeKind.RequiredNumber,
  tileid: AttributeKind.RequiredNumber,
} as const;
const exportAttributeKindMap = { format: AttributeKind.RequiredString, target: AttributeKind.RequiredString } as const;

// Opens an element inside a parent the reader models. An element the parent does not model is undefined, which keeps
// Its subtree unread. An undefined parent is the document's root.
export const openTmxFrame = (
  parent: TMXFrame | undefined,
  name: string,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame | undefined => {
  if (parent === undefined) return openTmxRoot(name, attributes, context);

  const tag = parseTmxTagName(name);
  switch (parent.tag) {
    case TMXTagName.Animation: {
      if (tag !== TMXTagName.Frame) return undefined;
      const frame = readTmxAttributes(attributes, animationFrameAttributeKindMap);
      parent.target.frames.push(frame);
      return { tag, target: frame, text: "" };
    }
    case TMXTagName.Chunk:
    case TMXTagName.Data:
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
      return openTmxLayerChild(parent, tag, attributes, context);
    case TMXTagName.EditorSettings:
      if (tag !== TMXTagName.Export) return undefined;
      parent.target.export = readTmxAttributes(attributes, exportAttributeKindMap);
      return { tag, target: parent.target.export, text: "" };
    case TMXTagName.Map:
      return openTmxMapChild(parent, name, tag, attributes);
    case TMXTagName.Object:
    case TMXTagName.Objectgroup:
      return openTmxObjectChild(parent, tag, attributes);
    case TMXTagName.Properties:
      return openTmxPropertyChild(parent, tag, attributes);
    case TMXTagName.Property:
      return tag === TMXTagName.Properties ? openTmxProperties(parent.target) : undefined;
    case TMXTagName.Tile:
      return openTmxTileChild(parent, tag, attributes);
    case TMXTagName.Tileset:
      return openTmxTilesetChild(parent, tag, attributes);
    default:
      return undefined;
  }
};
