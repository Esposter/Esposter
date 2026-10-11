import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { TMXFrame } from "#src/models/tmx/TMXFrame";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { createTmxEmbeddedTileset } from "#src/services/createTmxEmbeddedTileset";
import { createTmxMap } from "#src/services/createTmxMap";
import { parseTmxTagName } from "#src/services/parseTmxTagName";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A document's root is a map, or a tileset on its own. An external tileset has no children to read, so it has no frame.
export const openTmxRoot = (name: string, attributes: TMXAttributes): TMXFrame | undefined => {
  const tag = parseTmxTagName(name);
  switch (tag) {
    case TMXTagName.Map:
      return { tag, target: createTmxMap(attributes), text: "" };
    case TMXTagName.Tileset:
      if (attributes.source !== undefined) return undefined;
      return { tag, target: createTmxEmbeddedTileset(attributes), text: "" };
    default:
      throw new InvalidOperationError(Operation.Read, openTmxRoot.name, `${name} is not a map or a tileset`);
  }
};
