import type { TMXEditorSettingsParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXLayerGroupParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerGroupParsed";
import type { TMXLayerParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTilesetParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXTilesetParsed";
import { TMXMapShared } from "@/lib/tmxParser/models/tmx/shared/TMXMapShared";

export class TMXMapParsed extends TMXMapShared {
  editorsettings: TMXEditorSettingsParsed = {};
  tilesets: TMXTilesetParsed[] = [];
  layers: (TMXLayerParsed | TMXLayerGroupParsed)[] = [];
  properties: TMXPropertiesParsed = [];

  constructor(init?: Partial<TMXMapParsed>) {
    super();
    Object.assign(this, init);
  }
}
