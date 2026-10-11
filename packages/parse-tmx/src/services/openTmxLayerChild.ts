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

// Zstandard is the one Tiled compression this reader does not decode, since no browser ships a decompressor for it
const parseCompression = (value: string | undefined): Compression | undefined => {
  if (value === undefined) return undefined;
  if (value === Compression.Gzip) return Compression.Gzip;
  else if (value === Compression.Zlib) return Compression.Zlib;
  throw new InvalidOperationError(Operation.Read, parseCompression.name, `${value} is not a supported compression`);
};
const parseEncoding = (value: string | undefined): Encoding | undefined => {
  if (value === undefined) return undefined;
  if (value === Encoding.Base64) return Encoding.Base64;
  else if (value === Encoding.Csv) return Encoding.Csv;
  throw new InvalidOperationError(Operation.Read, parseEncoding.name, `${value} is not a supported encoding`);
};

// A layer's data is queued with the cells a finite map gives the layer, and is decoded once the document is read
const openTileData = (layer: TMXLayerParsed, attributes: TMXAttributes, context: TMXReadContext): TMXFrame => {
  const source: TMXDataSource = {
    chunked: false,
    compression: parseCompression(attributes.compression),
    encoding: parseEncoding(attributes.encoding),
    gids: [],
    text: "",
  };
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
    case TMXTagName.Tile:
      source.gids.push(readTmxAttributes(attributes, gidAttributeKindMap).gid);
      return undefined;
    case TMXTagName.Chunk: {
      if (parent.tag !== TMXTagName.Data) return undefined;
      const chunk = readTmxAttributes(attributes, chunkAttributeKindMap);
      parent.owner.chunks ??= [];
      parent.owner.chunks.push(chunk);
      source.chunked = true;
      const chunkSource: TMXDataSource = {
        chunked: false,
        compression: source.compression,
        encoding: source.encoding,
        gids: [],
        text: "",
      };
      context.pending.push({ owner: chunk, source: chunkSource });
      return { tag, target: chunkSource, text: "" };
    }
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
    case TMXTagName.Properties:
      return openTmxProperties(parent.target);
    case TMXTagName.Data:
      if (parent.tag !== TMXTagName.Layer) return undefined;
      return openTileData(parent.target, attributes, context);
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
