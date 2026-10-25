import type { DumpFile } from "#src/models/genshinText/DumpFile";

import {
  AVATAR_TALENT_DIRECTORY,
  GameLanguageCodeMap,
  SCENE_NPC_BORN_DIRECTORY,
  SCENE_NPC_BORN_FILE_NAME,
  SCENE_WORLD_AREA_DIRECTORY,
  SCENE_WORLD_AREA_FILE_NAME,
  TEXT_MAP_DIRECTORY_NAME,
} from "#src/services/genshinText/constants";
import { listHeldBinaryFiles } from "#src/services/genshinText/listHeldBinaryFiles";
import { listRemoteDirectory } from "#src/services/genshinText/listRemoteDirectory";

// The dump's own files a fetch may refresh: the readable texts of every language's folder, every table of ExcelBinOutput
// Whole or in its numbered parts, every language's text maps, the scene's NPC births and area outlines, every talent
// Config, and each other binary the dump already holds, each at its path under the dump's folder. Everything is held at the install's build, so a
// Reader never takes a row, a text or a step from an older patch
export const listDumpFiles = async (questListing: readonly DumpFile[]): Promise<DumpFile[]> => {
  const tableFiles = (await listRemoteDirectory("ExcelBinOutput")).filter(({ path }) => path.endsWith(".json"));
  const textMapFiles = (await listRemoteDirectory(TEXT_MAP_DIRECTORY_NAME)).filter(({ path }) =>
    path.endsWith(".json"),
  );
  const readableFiles = await Promise.all(
    Object.values(GameLanguageCodeMap).map((code) => listRemoteDirectory(`Readable/${code}`)),
  );
  const sceneFiles = await Promise.all(
    [
      { directory: SCENE_NPC_BORN_DIRECTORY, fileName: SCENE_NPC_BORN_FILE_NAME },
      { directory: SCENE_WORLD_AREA_DIRECTORY, fileName: SCENE_WORLD_AREA_FILE_NAME },
    ].map(async ({ directory, fileName }) =>
      (await listRemoteDirectory(directory)).filter(({ path }) => path === `${directory}/${fileName}`),
    ),
  );
  const talentFiles = (await listRemoteDirectory(AVATAR_TALENT_DIRECTORY)).filter(({ path }) => path.endsWith(".json"));
  const heldBinaryFiles = await listHeldBinaryFiles(questListing);
  // A held binary is also a scene file or a talent config, each listed once
  return [
    ...new Map(
      [
        ...tableFiles,
        ...textMapFiles,
        ...readableFiles.flat(),
        ...sceneFiles.flat(),
        ...talentFiles,
        ...heldBinaryFiles,
      ].map((file) => [file.path, file]),
    ).values(),
  ];
};
