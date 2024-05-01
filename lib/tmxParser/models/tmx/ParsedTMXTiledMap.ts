import { BaseTMXTiledMap } from "@/lib/tmxParser/models/tmx/BaseTMXTiledMap";
import type { TMXLayer } from "@/lib/tmxParser/models/tmx/TMXLayer";
import type { TMXTileset } from "@/lib/tmxParser/models/tmx/TMXTileset";

export class ParsedTMXTiledMap extends BaseTMXTiledMap {
  editorsettings: Record<string, unknown> | undefined = undefined;
  properties: Record<string, unknown> | undefined = undefined;
  layers: TMXLayer[] = [];
  tilesets: TMXTileset[] = [];

  constructor(init: Partial<ParsedTMXTiledMap>) {
    super();
    Object.assign(this, init);
  }
}
