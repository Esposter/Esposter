import type { TMXEditorSettingsParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXGroupLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTilesetParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXTilesetParsed";
import { TMXMapShared } from "@/lib/tmxParser/models/tmx/shared/TMXMapShared";

export class TMXMapParsed extends TMXMapShared {
  editorsettings: TMXEditorSettingsParsed = {};
  tilesets: TMXTilesetParsed[] = [];
  layers: (TMXLayerParsed | TMXGroupLayerParsed)[] = [];
  properties: TMXPropertiesParsed = [];

  constructor(init?: Partial<TMXMapParsed>) {
    super();
    Object.assign(this, init);
  }
}
