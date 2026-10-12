import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";
import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";

import { AttributeKind } from "#src/models/AttributeKind";
import { Compression } from "#src/models/Compression";
import { Encoding } from "#src/models/Encoding";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxImage } from "#src/services/createTmxImage";
import { openTmxLayer } from "#src/services/openTmxLayer";
import { openTmxProperties } from "#src/services/openTmxProperties";
import { readTmxAttributes } from "#src/services/readTmxAttributes";
import { InvalidOperationError, Operation } from "@esposter/shared";

type TMXLayerChildParent = Extract<
  TMXFrame,
  { tag: TMXTagName.Chunk | TMXTagName.Data | TMXTagName.Group | TMXTagName.ImageLayer | TMXTagName.Layer }
>;

const gidAttributeKindMap = { gid: AttributeKind.RequiredNumber } as const;
const chunkAttributeKindMap = {
  height: AttributeKind.RequiredNumber,
  width: AttributeKind.RequiredNumber,
  x: AttributeKind.RequiredNumber,
  y: AttributeKind.RequiredNumber,
} as const;

// An attribute holding one of an enum's values is read as that value, and any other value is refused by name. Zstandard
// Is the one Tiled compression the enum leaves out, since no browser ships a decompressor for it
const parseEnumAttribute = <T extends string>(
  operation: string,
  label: string,
  enumObject: Record<string, T>,
  value: string | undefined,
): T | undefined => {
  if (value === undefined) return undefined;
  const enumValue = Object.values(enumObject).find((member) => member === value);
  if (enumValue !== undefined) return enumValue;
  throw new InvalidOperationError(Operation.Read, operation, `${value} is not a supported ${label}`);
};
const parseCompression = (value: string | undefined): Compression | undefined =>
  parseEnumAttribute(parseCompression.name, "compression", Compression, value);
const parseEncoding = (value: string | undefined): Encoding | undefined =>
  parseEnumAttribute(parseEncoding.name, "encoding", Encoding, value);

// A data source holds the cells of one data element, read in the compression and encoding that element wrote
const createDataSource = (compression: Compression | undefined, encoding: Encoding | undefined): TMXDataSource => ({
  chunked: false,
  compression,
  encoding,
  gids: [],
  text: "",
});

// A layer's data is queued with the cells a finite map gives the layer, and is decoded once the document is read
const openTileData = (layer: TMXLayerParsed, attributes: TMXAttributes, context: TMXReadContext): TMXFrame => {
  const source = createDataSource(parseCompression(attributes.compression), parseEncoding(attributes.encoding));
  context.pending.push({ expectedCount: context.tileCount, owner: layer, source });
  return { owner: layer, tag: TMXTagName.Data, target: source, text: "" };
};

// Infinite maps write a layer's cells as chunks, each with its own queued data in the encoding the layer's data wrote.
// A `<tile>` cell is recorded as its gid, which is the form a data element with no encoding takes.
const openTmxDataChild = (
  parent: Extract<TMXFrame, { tag: TMXTagName.Chunk | TMXTagName.Data }>,
  tag: TMXTagName | undefined,
  attributes: TMXAttributes,
  context: TMXReadContext,
): TMXFrame | undefined => {
  const source = parent.target;
  switch (tag) {
    case TMXTagName.Chunk: {
      if (parent.tag !== TMXTagName.Data) return undefined;
      const chunk = readTmxAttributes(attributes, chunkAttributeKindMap);
      parent.owner.chunks ??= [];
      parent.owner.chunks.push(chunk);
      source.chunked = true;
      const chunkSource = createDataSource(source.compression, source.encoding);
      context.pending.push({ owner: chunk, source: chunkSource });
      return { tag, target: chunkSource, text: "" };
    }
    case TMXTagName.Tile:
      source.gids.push(readTmxAttributes(attributes, gidAttributeKindMap).gid);
      return undefined;
    default:
      return undefined;
  }
};

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
      if (parent.tag !== TMXTagName.Layer) return undefined;
      return openTileData(parent.target, attributes, context);
    case TMXTagName.Group:
    case TMXTagName.ImageLayer:
    case TMXTagName.Layer:
    case TMXTagName.Objectgroup:
      if (parent.tag !== TMXTagName.Group) return undefined;
      return openTmxLayer(parent.target.layers, tag, attributes);
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
