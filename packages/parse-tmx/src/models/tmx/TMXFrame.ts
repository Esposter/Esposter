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
export type TMXFrame = (
  | { owner: TMXLayerParsed; tag: typeof TMXTagName.Data; target: TMXDataSource }
  | { propertyType: PropertyType; tag: typeof TMXTagName.Property; target: TMXPropertyParsed; valueAttribute?: string }
  | { tag: typeof TMXTagName.Animation; target: TMXAnimationParsed }
  | { tag: typeof TMXTagName.Chunk; target: TMXDataSource }
  | { tag: typeof TMXTagName.EditorSettings; target: TMXEditorSettingsParsed }
  | {
      tag: typeof TMXTagName.Ellipse | typeof TMXTagName.Point | typeof TMXTagName.Polygon | typeof TMXTagName.Polyline;
      target: TMXObjectParsed;
    }
  | { tag: typeof TMXTagName.Export; target: TMXExportParsed }
  | { tag: typeof TMXTagName.Frame; target: TMXAnimationFrameParsed }
  | { tag: typeof TMXTagName.Group; target: TMXGroupLayerParsed }
  | { tag: typeof TMXTagName.Image; target: TMXImageParsed }
  | { tag: typeof TMXTagName.ImageLayer | typeof TMXTagName.Layer; target: TMXLayerParsed }
  | { tag: typeof TMXTagName.Map; target: TMXMapParsed }
  | { tag: typeof TMXTagName.Object; target: TMXObjectParsed }
  | { tag: typeof TMXTagName.Objectgroup; target: TMXLayerParsed }
  | { tag: typeof TMXTagName.Objectgroup; target: TMXTileParsed }
  | { tag: typeof TMXTagName.Properties; target: TMXPropertiesParsed }
  | { tag: typeof TMXTagName.Text; target: TMXObjectParsed }
  | { tag: typeof TMXTagName.Tile; target: TMXTileParsed }
  | { tag: typeof TMXTagName.Tileset; target: TMXEmbeddedTilesetParsed }
) & { text: string };
