import type { TMXEditorSettingsParsed } from "@/src/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXGroupLayerParsed } from "@/src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/src/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTilesetParsed } from "@/src/models/tmx/parsed/TMXTilesetParsed";
import { TMXMapShared } from "@/src/models/tmx/shared/TMXMapShared";

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
