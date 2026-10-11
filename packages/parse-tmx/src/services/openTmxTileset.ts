import type { TMXTilesetParsed } from "#src/models/tmx/parsed/TMXTilesetParsed";
import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxEmbeddedTileset } from "#src/services/createTmxEmbeddedTileset";
import { parseNumberAttribute } from "#src/services/parseNumberAttribute";

// A tileset that names a file is kept as the reference it is, and its file is not opened. Its children are not read.
export const openTmxTileset = (tilesets: TMXTilesetParsed[], attributes: TMXAttributes): TMXFrame | undefined => {
  if (attributes.source !== undefined) {
    tilesets.push({ firstgid: parseNumberAttribute(attributes.firstgid) ?? 0, source: attributes.source });
    return undefined;
  }

  const tileset = createTmxEmbeddedTileset(attributes);
  tilesets.push(tileset);
  return { tag: TMXTagName.Tileset, target: tileset, text: "" };
};
