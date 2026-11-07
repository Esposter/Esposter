import {
  GAME_TEXT_DIRECTORY,
  GENSHIN_TEXT_PRODUCER_PATHS,
  GENSHIN_TEXT_SOURCE,
  QUEST_BINARY_DIRECTORY_PATH,
} from "#src/services/genshinText/constants";
import { fetchRemoteFiles } from "#src/services/genshinText/fetchRemoteFiles";
import { listCarriedQuestBinaryFiles } from "#src/services/genshinText/listCarriedQuestBinaryFiles";
import { listDumpFiles } from "#src/services/genshinText/listDumpFiles";
import { listRemoteDirectory } from "#src/services/genshinText/listRemoteDirectory";
import { writeProvenance } from "#src/services/provenance/writeProvenance";

// Every readable text, table, text map and held binary the dump lacks, or holds with other content, and each binary a carried
// Quest reads, fetched from AnimeGameData at its pinned commit. Returns a note of the count fetched and the count kept, and
// Stamps the dump with the commit it was read at
export const fetchDump = async (): Promise<string[]> => {
  const questListing = await listRemoteDirectory(QUEST_BINARY_DIRECTORY_PATH);
  const remoteFiles = await listDumpFiles(questListing);
  const dumpFiles = await fetchRemoteFiles(remoteFiles);
  // A carried binary the first pass listed is fetched or kept there, so the second pass leaves it out
  const remotePaths = new Set(remoteFiles.map(({ path }) => path));
  const questFiles = await fetchRemoteFiles(
    listCarriedQuestBinaryFiles(questListing).filter(({ path }) => !remotePaths.has(path)),
  );
  await writeProvenance(GAME_TEXT_DIRECTORY, {
    command: "genshin:text fetch",
    producerPaths: GENSHIN_TEXT_PRODUCER_PATHS,
    sources: [GENSHIN_TEXT_SOURCE],
  });
  return [
    `${dumpFiles.fetched + questFiles.fetched} dump files fetched, ${dumpFiles.held + questFiles.held} already held`,
  ];
};
