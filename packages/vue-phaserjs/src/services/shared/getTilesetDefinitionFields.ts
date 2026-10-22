import type { TMXEmbeddedTilesetParsed } from "parse-tmx";

import { omitUndefined } from "#src/services/shared/omitUndefined";

// The map owns each tileset's firstgid, which a tileset definition does not carry, so it is never taken from one
// A field the definition leaves out is not returned either, since merging it as undefined would blank the value Phaser reads
export const getTilesetDefinitionFields = (definition: Partial<TMXEmbeddedTilesetParsed>) =>
  omitUndefined({ ...definition, firstgid: undefined });
