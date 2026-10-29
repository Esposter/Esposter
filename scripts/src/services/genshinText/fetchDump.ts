import { QUEST_BINARY_DIRECTORY_PATH } from "#src/services/genshinText/constants";
import { fetchRemoteFiles } from "#src/services/genshinText/fetchRemoteFiles";
import { listCarriedQuestBinaryFiles } from "#src/services/genshinText/listCarriedQuestBinaryFiles";
import { listDumpFiles } from "#src/services/genshinText/listDumpFiles";
import { listRemoteDirectory } from "#src/services/genshinText/listRemoteDirectory";

// Every readable text, table, text map and held binary the dump lacks, or holds with other content, and each binary a carried
// Quest reads, fetched from AnimeGameData. Returns a note of the count fetched and the count kept
export const fetchDump = async (): Promise<string[]> => {
  const questListing = await listRemoteDirectory(QUEST_BINARY_DIRECTORY_PATH);
  const remoteFiles = await listDumpFiles(questListing);
  const dumpFiles = await fetchRemoteFiles(remoteFiles);
  // A carried binary the first pass listed is fetched or kept there, so the second pass leaves it out
  const remotePaths = new Set(remoteFiles.map(({ path }) => path));
  const questFiles = await fetchRemoteFiles(
    listCarriedQuestBinaryFiles(questListing).filter(({ path }) => !remotePaths.has(path)),
  );
  return [
    `${dumpFiles.fetched + questFiles.fetched} dump files fetched, ${dumpFiles.held + questFiles.held} already held`,
  ];
};
