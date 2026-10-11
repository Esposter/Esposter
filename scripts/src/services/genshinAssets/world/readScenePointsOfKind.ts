import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { ScenePointExemplar } from "#src/models/genshinAssets/world/ScenePointExemplar";

import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Every point of the scene of the exemplar's kind, each by its id. Nothing in the dump tells one kind of point from another
// But the obfuscated type it is written as, so the kind is the exemplar's, and a file without the exemplar throws
export const readScenePointsOfKind = async ({
  category,
  file,
  id,
}: ScenePointExemplar): Promise<[string, DumpedScenePoint][]> => {
  const pointsJson = await readFile(join(GAME_TEXT_DIRECTORY, file), "utf8");
  const categoryPoints =
    parseMachineJson<Record<string, Record<string, DumpedScenePoint> | undefined>>(pointsJson)[category] ?? {};
  const kind = categoryPoints[id]?.$type;
  if (kind === undefined) throw new InvalidOperationError(Operation.Read, file, `has no point ${id}`);
  return Object.entries(categoryPoints).filter(([, point]) => point.$type === kind);
};
