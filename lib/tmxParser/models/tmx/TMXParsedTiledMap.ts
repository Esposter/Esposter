import { TMXBaseTiledMap } from "@/lib/tmxParser/models/tmx/TMXBaseTiledMap";
import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXLayerGroup } from "@/lib/tmxParser/models/tmx/TMXLayerGroup";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";

export class TMXParsedTiledMap extends TMXBaseTiledMap {
  editorsettings: Record<string, unknown> | undefined = undefined;
  properties: Record<string, unknown> | undefined = undefined;
  layers: (TMXLayer | TMXLayerGroup)[] = [];
  tilesets: TMXTileset[] = [];

  constructor(init: Partial<TMXParsedTiledMap>) {
    super();
    Object.assign(this, init);
  }
}
