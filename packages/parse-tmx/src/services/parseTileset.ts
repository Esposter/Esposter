import type { TMXEmbeddedTilesetParsed } from "#src/models/tmx/parsed/TMXEmbeddedTilesetParsed";
import type { Result } from "neverthrow";

import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { readTmxDocument } from "#src/services/readTmxDocument";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// A tileset file on its own, as Tiled writes an external tileset: the embedded tileset it holds, read without its map
export const parseTileset = (xmlString: string): Result<TMXEmbeddedTilesetParsed, Error> =>
  getResult(() => readTmxDocument(xmlString)).andThen((document) =>
    getResult(() => {
      const root = document.root;
      if (root?.tag !== TMXTagName.Tileset)
        throw new InvalidOperationError(Operation.Read, parseTileset.name, "has no embedded tileset root element");
      return root.target;
    }),
  );
