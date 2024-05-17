import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
import type { TMXEmbeddedTilesetNode } from "parse-tmx/models/tmx/node/TMXEmbeddedTilesetNode";
import { TMXNodeType } from "parse-tmx/models/tmx/node/TMXNodeType";
import type { TMXTilesetNode } from "parse-tmx/models/tmx/node/TMXTilesetNode";
import type { TMXTilesetParsed } from "parse-tmx/models/tmx/parsed/TMXTilesetParsed";
import type { TMXImageShared } from "parse-tmx/models/tmx/shared/TMXImageShared";
import { isExternalTileset } from "parse-tmx/util/isExternalTileset";
import { parseTile } from "parse-tmx/util/parseTile";

export const parseTileset = (node: TMXTilesetNode): TMXTilesetParsed => {
  if (isExternalTileset(node.$)) return structuredClone(node.$);

  const { $, $$, tile } = node as TMXEmbeddedTilesetNode;

  for (const childNode of $$ ?? []) {
    const tmxNodeType = childNode["#name"] as TMXNodeType;
    if (tmxNodeType !== TMXNodeType.Image) continue;

    const image = structuredClone(childNode.$ as TMXImageShared);
    const tiles = tile?.map((t) => parseTile(t)) ?? [];
    return { ...$, image, tiles };
  }

  throw new InvalidOperationError(Operation.Read, parseTileset.name, $.name);
};
