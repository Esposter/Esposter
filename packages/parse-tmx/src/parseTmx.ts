import type { TMXReadContext } from "#src/models/tmx/TMXReadContext";
import type { ResultAsync } from "neverthrow";

import { TMXParsed } from "#src/models/tmx/parsed/TMXParsed";
import { TMXTagName } from "#src/models/tmx/TMXTagName";
import { assignTileData } from "#src/services/assignTileData";
import { readTmxDocument } from "#src/services/readTmxDocument";
import { getResult, getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// Matches phaser's tmx => json tilemap export transformation, and additionally supports external tilesets.
export const parseTmx = (xmlString: string, translateFlips = false): ResultAsync<TMXParsed, Error> => {
  const context: TMXReadContext = { pending: [], tileCount: 0 };
  return getResult(() => readTmxDocument(xmlString, context)).asyncAndThen((root) =>
    getResultAsync(async () => {
      if (root?.tag !== TMXTagName.Map)
        throw new InvalidOperationError(Operation.Read, parseTmx.name, "has no map root element");

      await assignTileData(context.pending, translateFlips);
      return new TMXParsed(root.target);
    }),
  );
};
