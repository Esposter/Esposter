import { Operation } from "@/models/shared/Operation";
import { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
import type { TMXTilesetNode } from "@/models/tmx/node/TMXTilesetNode";
import type { TMXTilesetParsed } from "@/models/tmx/parsed/TMXTilesetParsed";
import type { TMXImageShared } from "@/models/tmx/shared/TMXImageShared";
import { isExternalTileset } from "@/util/isExternalTileset";
import { parseTile } from "@/util/parseTile";
import { InvalidOperationError } from "~/packages/shared/models/error/InvalidOperationError";
import type { TMXEmbeddedTi } from ~/packages/shared / models / shared / Operationodels / tmx / node / TMXEmbeddedTilesetNode;
";

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
