import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import {
  ANIMESTUDIO_TOOL,
  EXTRACTED_DIRECTORY,
  GENSHIN_ANIMESTUDIO_OPTIONS,
  INSTALLED_BLOCKS_DIRECTORY,
} from "#src/services/genshinAssets/shared/constants";
import { getPathHash } from "#src/services/genshinAssets/shared/getPathHash";
import {
  EXCEL_BIN_OUTPUT_PATH,
  GameLanguageCodeMap,
  GENSHIN_TEXT_PRODUCER_PATHS,
  TEXT_MAP_DIRECTORY,
  TextMapChunkRangeMap,
} from "#src/services/genshinText/constants";
import { decodeChunkCandidates } from "#src/services/genshinText/decodeChunkCandidates";
import { decodeTextMap } from "#src/services/genshinText/decodeTextMap";
import { writeProvenance } from "#src/services/provenance/writeProvenance";
import { readIndexedAssets } from "#src/services/recreation/animeStudio/readIndexedAssets";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// How many of the chunks no row decodes the error names, the rest counted
const UNDECODED_SAMPLE_SIZE = 5;

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
  // A name can be shared by a chunk and an unrelated asset in another block, so every row under it is a candidate
  const assets = await readIndexedAssets(
    ({ name, type }) => type === AssetType.MiHoYoBinData && chunkNames.has(name),
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );

  const exportDirectory = join(EXTRACTED_DIRECTORY, "text");
  rmSync(exportDirectory, { force: true, recursive: true });
  // Each block exports into its own folder, since two blocks' assets of one name would overwrite each other in one
  for (const [block, blockAssets] of Map.groupBy(assets, (asset) => asset.block))
    runAnimeStudio(
      [
        join(INSTALLED_BLOCKS_DIRECTORY, block),
        join(exportDirectory, block),
        "--names",
        `^(${blockAssets.map(({ name }) => name).join("|")})$`,
        "--types",
        AssetType.MiHoYoBinData,
        "--export_type",
        AnimeStudioExportType.Raw,
        "--group_assets",
        AnimeStudioGroupType.ByType,
      ],
      GENSHIN_ANIMESTUDIO_OPTIONS,
    );

  // The length prefix AnimeStudio's raw export leads each blob with, the payload it counts being the chunk
  const readTextMap = ({ block, name }: IndexedAsset): Map<string, string> => {
    const path = join(exportDirectory, block, AssetType.MiHoYoBinData, `${name}.dat`);
    if (!existsSync(path)) throw new InvalidOperationError(Operation.Read, path, "was not exported");
    const blob = readFileSync(path);
    if (blob.byteLength < 4)
      throw new InvalidOperationError(Operation.Read, path, "is too short for its length prefix");
    return decodeTextMap(blob.subarray(4, 4 + blob.readUInt32LE(0)));
  };
  const candidatesByName = Map.groupBy(assets, ({ name }) => name);
  const decoded = chunks.map((chunk) => ({
    ...chunk,
    decode: decodeChunkCandidates(candidatesByName.get(chunk.name) ?? [], readTextMap),
  }));
  const undecoded = decoded.flatMap(({ chunk, code, decode, directory }) =>
    decode.ok ? [] : [`${code} ${directory} ${chunk} (${decode.reasons.join("; ") || "no row in the asset index"})`],
  );
  if (undecoded.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      "text chunks",
      `${undecoded.length} of ${chunks.length} have no row the text map decoder accepts, including ${undecoded.slice(0, UNDECODED_SAMPLE_SIZE).join(", ")}`,
    );
  const accepted = decoded.flatMap(({ chunk, code, decode, directory }) =>
    decode.ok ? [{ chunk, code, directory, textMap: decode.textMap }] : [],
  );

  rmSync(TEXT_MAP_DIRECTORY, { force: true, recursive: true });
  mkdirSync(TEXT_MAP_DIRECTORY, { recursive: true });
  for (const { chunk, code, directory, textMap } of accepted)
    writeJsonFile(join(TEXT_MAP_DIRECTORY, `${directory}${code}_${chunk}.json`), Object.fromEntries(textMap));
  // Decoded from the installed game and AnimeStudio alone, so the stamp names no source fetched at a commit
  await writeProvenance(TEXT_MAP_DIRECTORY, {
    command: "genshin:text decode",
    producerPaths: GENSHIN_TEXT_PRODUCER_PATHS,
    tools: [ANIMESTUDIO_TOOL],
  });

  return languageCodes.map((code) => {
    const languageMaps = accepted.filter((chunk) => chunk.code === code);
    const entries = languageMaps.reduce((total, { textMap }) => total + textMap.size, 0);
    return `${code}: ${languageMaps.length} chunks, ${entries} strings`;
  });
};
