import type { TMXEditorSettingsParsed } from "@/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXGroupLayerParsed } from "@/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "@/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTilesetParsed } from "@/models/tmx/parsed/TMXTilesetParsed";

import { TMXMapShared } from "@/models/tmx/shared/TMXMapShared";

export class TMXMapParsed extends TMXMapShared {
  editorsettings: TMXEditorSettingsParsed = {};
  layers: (TMXGroupLayerParsed | TMXLayerParsed)[] = [];
  properties: TMXPropertiesParsed = [];
  tilesets: TMXTilesetParsed[] = [];

  constructor(init?: Partial<TMXMapParsed>) {
    super();
    Object.assign(this, init);
  }
}
