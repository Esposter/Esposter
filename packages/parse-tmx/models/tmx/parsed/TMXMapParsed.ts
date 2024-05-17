import type { TMXEditorSettingsParsed } from "parse-tmx/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXGroupLayerParsed } from "parse-tmx/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "parse-tmx/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "parse-tmx/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTilesetParsed } from "parse-tmx/models/tmx/parsed/TMXTilesetParsed";
import { TMXMapShared } from "parse-tmx/models/tmx/shared/TMXMapShared";

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
