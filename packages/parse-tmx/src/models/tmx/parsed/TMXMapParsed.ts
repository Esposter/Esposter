import type { TMXEditorSettingsParsed } from "#src/models/tmx/parsed/TMXEditorSettingsParsed";
import type { TMXGroupLayerParsed } from "#src/models/tmx/parsed/TMXGroupLayerParsed";
import type { TMXLayerParsed } from "#src/models/tmx/parsed/TMXLayerParsed";
import type { TMXPropertiesParsed } from "#src/models/tmx/parsed/TMXPropertiesParsed";
import type { TMXTilesetParsed } from "#src/models/tmx/parsed/TMXTilesetParsed";

// The attributes the map element carries, with the defaults a map without them reads as
export class TMXMapParsed {
  declare backgroundcolor?: string;
  declare compressionlevel?: number;
  editorsettings: TMXEditorSettingsParsed = {};
  height = 0;
  declare hexsidelength?: number;
  infinite = 0;
  layers: (TMXGroupLayerParsed | TMXLayerParsed)[] = [];
  nextlayerid = 0;
  nextobjectid = 0;
  orientation = "";
  declare parallaxoriginx?: number;
  declare parallaxoriginy?: number;
  properties: TMXPropertiesParsed = [];
  renderorder = "";
  declare staggeraxis?: string;
  declare staggerindex?: string;
  tiledversion = "";
  tileheight = 0;
  tilesets: TMXTilesetParsed[] = [];
  tilewidth = 0;
  version = 0;
  width = 0;
}
