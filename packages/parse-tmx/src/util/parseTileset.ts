import { Operation } from "@/models/shared/Operation";
import type { TMXEmbeddedTi~/packages/shared/models/shared/Operationodels/tmx/node/TMXEmbeddedTilesetNode";
import { TMXNodeType } from "@/src/models/tmx/node/TMXNodeType";
import type { TMXTilesetNode } from "@/src/models/tmx/node/TMXTilesetNode";
import type { TMXTilesetParsed } from "@/src/models/tmx/parsed/TMXTilesetParsed";
import type { TMXImageShared } from "@/src/models/tmx/shared/TMXImageShared";
import { isExternalTileset } from "@/src/util/isExternalTileset";
import { parseTile } from "@/src/util/parseTile";
import { InvalidOperationError } from "~/packages/shared/models/error/InvalidOperationError";

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
