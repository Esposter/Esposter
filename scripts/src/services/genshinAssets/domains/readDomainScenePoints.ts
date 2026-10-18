import type { DumpedEntryPoint } from "#src/models/genshinAssets/domains/DumpedEntryPoint";

import { DOMAIN_POINT_CATEGORY } from "#src/services/genshinAssets/domains/constants";
import { SCENE_POINT_FILE } from "#src/services/genshinAssets/shared/constants";
import { GAME_TEXT_DIRECTORY } from "#src/services/genshinText/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Every point of the open world's scene the dump files under the domain category, each by its id, read raw: a field the
// Dump leaves out at its default is absent here, and each reader names its own default
export const readDomainScenePoints = async (): Promise<Record<string, DumpedEntryPoint>> => {
  const pointsJson = await readFile(join(GAME_TEXT_DIRECTORY, SCENE_POINT_FILE), "utf8");
  const categoryPoints =
    parseMachineJson<Record<string, Record<string, DumpedEntryPoint> | undefined>>(pointsJson)[DOMAIN_POINT_CATEGORY];
  if (!categoryPoints)
    throw new InvalidOperationError(Operation.Read, SCENE_POINT_FILE, `has no ${DOMAIN_POINT_CATEGORY} category`);
  return categoryPoints;
};
