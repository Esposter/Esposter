import type { TMXAnimationParsed } from "#src/models/tmx/parsed/TMXAnimationParsed";
import type { TMXEditorSettingsParsed } from "#src/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXEmbeddedTilesetParsed } from "#src/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { TMXPropertyParsed } from "#src/models/tmx/parsed/TMXPropertyParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { AttributeKind } from "#src/models/AttributeKind";
import { PropertyType } from "#src/models/PropertyType";
import { TMXMapParsed } from "#src/models/tmx/parsed/TMXMapParsed";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxImage } from "#src/services/createTmxImage";
import { openTmxLayer } from "#src/services/openTmxLayer";
import { openTmxLayerChild } from "#src/services/openTmxLayerChild";
import { openTmxObjectChild } from "#src/services/openTmxObjectChild";
import { openTmxProperties } from "#src/services/openTmxProperties";
import { parseEnumAttribute } from "#src/services/parseEnumAttribute";
import { readTmxAttributes } from "#src/services/readTmxAttributes";
import { InvalidOperationError, Operation } from "@esposter/shared";

const mapAttributeKindMap = {
  backgroundcolor: AttributeKind.String,
  compressionlevel: AttributeKind.Number,
  height: AttributeKind.RequiredNumber,
  hexsidelength: AttributeKind.Number,
  infinite: AttributeKind.RequiredNumber,
  nextlayerid: AttributeKind.RequiredNumber,
  nextobjectid: AttributeKind.RequiredNumber,
  orientation: AttributeKind.RequiredString,
  parallaxoriginx: AttributeKind.Number,
  parallaxoriginy: AttributeKind.Number,
  renderorder: AttributeKind.RequiredString,
  staggeraxis: AttributeKind.String,
  staggerindex: AttributeKind.String,
  tiledversion: AttributeKind.RequiredString,
  tileheight: AttributeKind.RequiredNumber,
  tilewidth: AttributeKind.RequiredNumber,
  version: AttributeKind.RequiredNumber,
  width: AttributeKind.RequiredNumber,
} as const;
const embeddedTilesetAttributeKindMap = {
  columns: AttributeKind.RequiredNumber,
  firstgid: AttributeKind.RequiredNumber,
  margin: AttributeKind.Number,
  name: AttributeKind.RequiredString,
  spacing: AttributeKind.Number,
  tilecount: AttributeKind.RequiredNumber,
  tileheight: AttributeKind.RequiredNumber,
  tilewidth: AttributeKind.RequiredNumber,
} as const;
const externalTilesetAttributeKindMap = {
  firstgid: AttributeKind.RequiredNumber,
  source: AttributeKind.RequiredString,
} as const;
const tileAttributeKindMap = {
  id: AttributeKind.RequiredNumber,
  probability: AttributeKind.Number,
  terrain: AttributeKind.String,
  type: AttributeKind.String,
} as const;
const animationFrameAttributeKindMap = {
  duration: AttributeKind.RequiredNumber,
  tileid: AttributeKind.RequiredNumber,
} as const;
const exportAttributeKindMap = { format: AttributeKind.RequiredString, target: AttributeKind.RequiredString } as const;
const propertyAttributeKindMap = { name: AttributeKind.RequiredString } as const;

// A tileset written in the document, which is the embedded tileset a tileset file is read as too
const createEmbeddedTileset = (attributes: TMXAttributes): TMXEmbeddedTilesetParsed => ({
  ...readTmxAttributes(attributes, embeddedTilesetAttributeKindMap),
  tiles: [],
});
const parseTmxTagName = (name: string): TMXTagName | undefined =>
  Object.values(TMXTagName).find((tagName) => tagName === name);
// A property without a type is a string, as Tiled writes it
const parsePropertyType = (value: string | undefined): PropertyType =>
  parseEnumAttribute(parsePropertyType.name, "property type", PropertyType, value) ?? PropertyType.String;

// A document's root is a map, or a tileset on its own. An external tileset has no children to read, so it has no frame.
const openTmxRoot = (name: string, attributes: TMXAttributes, context: TMXReadContext): TMXFrame | undefined => {
  const tag = parseTmxTagName(name);
  switch (tag) {
    case TMXTagName.Map: {
      const map = Object.assign(new TMXMapParsed(), readTmxAttributes(attributes, mapAttributeKindMap));
      context.tileCount = map.width * map.height;
      return { tag, target: map, text: "" };
    }
    case TMXTagName.Tileset:
      if (attributes.source !== undefined) return undefined;
      return { tag, target: createEmbeddedTileset(attributes), text: "" };
    default:
      throw new InvalidOperationError(Operation.Read, openTmxRoot.name, `${name} is not a map or a tileset`);
  }
};

// The children a map element does not model are skipped, and any other child is refused by name
const openTmxMapChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Map }>,
  name: string,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  const map = parent.target;
  switch (tag) {
    case TMXTagName.Data:
    case TMXTagName.Export:
    case TMXTagName.Image:
    case TMXTagName.Object:
    case TMXTagName.Property:
      return undefined;
    case TMXTagName.EditorSettings: {
      const editorSettings: TMXEditorSettingsParsed = {};
      map.editorsettings = editorSettings;
      return { tag, target: editorSettings, text: "" };
    }
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
    case TMXTagName.Objectgroup:
      return openTmxLayer(map.layers, tag, attributes);
    case TMXTagName.Properties:
      return openTmxProperties(map);
    case TMXTagName.Tileset: {
      // A tileset that names a file is kept as the reference it is, and its file is not opened. Its children are not read.
      if (attributes.source !== undefined) {
        map.tilesets.push(readTmxAttributes(attributes, externalTilesetAttributeKindMap));
        return undefined;
      }
      const tileset = createEmbeddedTileset(attributes);
      map.tilesets.push(tileset);
      return { tag, target: tileset, text: "" };
    }
    default:
      throw new InvalidOperationError(Operation.Read, openTmxMapChild.name, `${name} is not a map child`);
  }
};

// A tile holds an animation, an image and its object group and properties
const openTmxTileChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Tile }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  const tile = parent.target;
  switch (tag) {
    case TMXTagName.Animation: {
      const animation: TMXAnimationParsed = { frames: [] };
      tile.animation = animation;
      return { tag, target: animation, text: "" };
    }
    case TMXTagName.Image: {
      const image = createTmxImage(attributes);
      tile.image = image;
      return { tag, target: image, text: "" };
    }
    case TMXTagName.Objectgroup:
      return { tag, target: tile, text: "" };
    case TMXTagName.Properties:
      return openTmxProperties(tile);
    default:
      return undefined;
  }
};

// A tileset holds its image, when it has one, and its tiles
const openTmxTilesetChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Tileset }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  const tileset = parent.target;
  switch (tag) {
    case TMXTagName.Image: {
      const image = createTmxImage(attributes);
      tileset.image = image;
      return { tag, target: image, text: "" };
    }
    case TMXTagName.Tile: {
      const tile = readTmxAttributes(attributes, tileAttributeKindMap);
      tileset.tiles.push(tile);
      return { tag, target: tile, text: "" };
    }
    default:
      return undefined;
  }
};

// A property's value is read once it closes, since its character data is what it holds when it has no value attribute
const openTmxPropertyChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Properties }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
): TMXFrame | undefined => {
  if (tag !== TMXTagName.Property) return undefined;
  const target: TMXPropertyParsed = { ...readTmxAttributes(attributes, propertyAttributeKindMap), value: "" };
  parent.target.push(target);
  return { propertyType: parsePropertyType(attributes.type), tag, target, text: "", valueAttribute: attributes.value };
};

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
