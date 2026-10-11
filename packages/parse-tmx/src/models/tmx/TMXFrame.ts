import type { PropertyType } from "#src/models/PropertyType";
import type { TMXAnimationFrameParsed } from "#src/models/tmx/parsed/TMXAnimationFrameParsed";
import type { TMXAnimationParsed } from "#src/models/tmx/parsed/TMXAnimationParsed";
import type { TMXEditorSettingsParsed } from "#src/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXEmbeddedTilesetParsed } from "#src/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { TMXExportParsed } from "#src/models/tmx/parsed/TMXExportParsed";
import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXMapParsed } from "#src/models/tmx/parsed/TMXMapParsed";
import type { TMXObjectParsed } from "#src/models/tmx/parsed/TMXObjectParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXPropertyParsed } from "#src/models/tmx/parsed/TMXPropertyParsed";
import type { TMXTileParsed } from "#src/models/tmx/parsed/TMXTileParsed";
import type { TMXDataSource } from "#src/models/tmx/TMXDataSource";
import type { TMXTagName } from "#src/models/tmx/TMXTagName";

// An element the reader is inside of. Each frame holds the model it is filling, which is attached to its parent when
// The element opens, so the model is complete as the document is read and no intermediate copy is built. `text` is the
// Element's character data, which only some elements read.
export type TMXFrame = { text: string } & (
  | { tag: TMXTagName.Animation; target: TMXAnimationParsed }
  | { tag: TMXTagName.Chunk; target: TMXDataSource }
  | { owner: TMXLayerParsed; tag: TMXTagName.Data; target: TMXDataSource }
  | { tag: TMXTagName.EditorSettings; target: TMXEditorSettingsParsed }
  | { tag: TMXTagName.Ellipse | TMXTagName.Point | TMXTagName.Polygon | TMXTagName.Polyline; target: TMXObjectParsed }
  | { tag: TMXTagName.Export; target: TMXExportParsed }
  | { tag: TMXTagName.Frame; target: TMXAnimationFrameParsed }
  | { tag: TMXTagName.Group; target: TMXGroupLayerParsed }
  | { tag: TMXTagName.Image; target: TMXImageParsed }
  | { tag: TMXTagName.ImageLayer | TMXTagName.Layer; target: TMXLayerParsed }
  | { tag: TMXTagName.Objectgroup; target: TMXLayerParsed }
  | { tag: TMXTagName.Map; target: TMXMapParsed }
  | { tag: TMXTagName.Object; target: TMXObjectParsed }
  | { tag: TMXTagName.Objectgroup; target: TMXTileParsed }
  | { tag: TMXTagName.Properties; target: TMXPropertiesParsed }
  | { propertyType: PropertyType; tag: TMXTagName.Property; target: TMXPropertyParsed; valueAttribute?: string }
  | { tag: TMXTagName.Text; target: TMXObjectParsed }
  | { tag: TMXTagName.Tile; target: TMXTileParsed }
  | { tag: TMXTagName.Tileset; target: TMXEmbeddedTilesetParsed }
);
