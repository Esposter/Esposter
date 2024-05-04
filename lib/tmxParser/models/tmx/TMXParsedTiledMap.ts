import { TMXBaseTiledMap } from "@/lib/tmxParser/models/tmx/TMXBaseTiledMap";
import type { TMXLayerGroup } from "@/lib/tmxParser/models/tmx/TMXLayerGroup";
import type { TMXParsedLayer } from "@/lib/tmxParser/models/tmx/TMXParsedLayer";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";

export class TMXParsedTiledMap extends TMXBaseTiledMap {
  editorsettings: Record<string, unknown> | null = null;
  properties: Record<string, unknown> | null = null;
  layers: (TMXParsedLayer | TMXLayerGroup)[] = [];
  tilesets: TMXTileset[] = [];

  constructor(init: Partial<TMXParsedTiledMap>) {
    super();
    Object.assign(this, init);
  }
}
