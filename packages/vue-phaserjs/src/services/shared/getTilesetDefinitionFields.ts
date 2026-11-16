import type { TMXEmbeddedTilesetParsed } from "parse-tmx";
import type { UndefinedOnPartial } from "type-fest";

import { omitUndefined } from "@esposter/shared";

// The map owns each tileset's firstgid, which a tileset definition does not carry, so it is never taken from one
// A field the definition leaves out is not returned either, since merging it as undefined would blank the value Phaser reads
export const getTilesetDefinitionFields = (definition: UndefinedOnPartial<Partial<TMXEmbeddedTilesetParsed>>) =>
  omitUndefined({ ...definition, firstgid: undefined });
