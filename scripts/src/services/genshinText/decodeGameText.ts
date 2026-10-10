import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { getInstalledBlockPath } from "#src/services/genshinAssets/shared/getInstalledBlockPath";
import { getPathHash } from "#src/services/genshinAssets/shared/getPathHash";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import {
  EXCEL_BIN_OUTPUT_PATH,
  GameLanguageCodeMap,
  TEXT_MAP_DIRECTORY,
  TextMapChunkRangeMap,
} from "#src/services/genshinText/constants";
import { decodeTextMap } from "#src/services/genshinText/decodeTextMap";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// Every language's text map decoded from the installed game's own chunks, in place of the community dump's maps. The
// Chunks are found by the path hash each is named under, exported from the blocks the game loads, and every map is
// Decoded before the dump's maps are emptied, so a failed decode leaves the dump whole. Returns a note per language
export const decodeGameText = async (): Promise<string[]> => {
  const languageCodes = Object.values(GameLanguageCodeMap);
  const chunks = languageCodes.flatMap((code) =>
    Object.entries(TextMapChunkRangeMap).flatMap(([directory, { first, last }]) =>
      Array.from({ length: last - first + 1 }, (_value, offset) => {
        const chunk = first + offset;
        const name = getPathHash(`${EXCEL_BIN_OUTPUT_PATH}/${directory}/${code}/Hash/${chunk}`);
        return { chunk, code, directory, name };
      }),
    ),
  );
  const chunkNames = new Set(chunks.map(({ name }) => name));
  const assets = await readIndexedAssets(({ name, type }) => type === AssetType.MiHoYoBinData && chunkNames.has(name));
  if (assets.length !== chunks.length)
    throw new InvalidOperationError(
      Operation.Read,
      "text chunks",
      `${chunks.length - assets.length} of ${chunks.length} are missing from the asset index`,
    );

  const exportDirectory = join(EXTRACTED_DIRECTORY, "text");
  rmSync(exportDirectory, { force: true, recursive: true });
  for (const [block, blockAssets] of Map.groupBy(assets, (asset) => asset.block))
    runAnimeStudio([
      getInstalledBlockPath(block),
      exportDirectory,
      "--names",
      `^(${blockAssets.map(({ name }) => name).join("|")})$`,
      "--types",
      AssetType.MiHoYoBinData,
      "--export_type",
      AnimeStudioExportType.Raw,
      "--group_assets",
      AnimeStudioGroupType.ByType,
    ]);

  // The length prefix AnimeStudio's raw export leads each blob with, the payload it counts being the chunk
  const decoded = chunks.map(({ chunk, code, directory, name }) => {
    const blob = readFileSync(join(exportDirectory, AssetType.MiHoYoBinData, `${name}.dat`));
    const payload = blob.subarray(4, 4 + blob.readUInt32LE(0));
    return { chunk, code, directory, textMap: decodeTextMap(payload) };
  });

  rmSync(TEXT_MAP_DIRECTORY, { force: true, recursive: true });
  mkdirSync(TEXT_MAP_DIRECTORY, { recursive: true });
  for (const { chunk, code, directory, textMap } of decoded)
    writeJsonFile(join(TEXT_MAP_DIRECTORY, `${directory}${code}_${chunk}.json`), Object.fromEntries(textMap));

  return languageCodes.map((code) => {
    const languageMaps = decoded.filter((chunk) => chunk.code === code);
    const entries = languageMaps.reduce((total, { textMap }) => total + textMap.size, 0);
    return `${code}: ${languageMaps.length} chunks, ${entries} strings`;
  });
};
