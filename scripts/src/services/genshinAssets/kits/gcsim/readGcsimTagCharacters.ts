import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";

import {
  GCSIM_CHARACTERS_PATH,
  GCSIM_CONFIG_FILE,
  GCSIM_REPOSITORY_URL,
  GCSIM_TAG,
} from "#src/services/genshinAssets/kits/constants";
import { GcsimFolderSubfoldersMap } from "#src/services/genshinAssets/kits/gcsim/GcsimFolderSubfoldersMap";
import { readGcsimCharacter } from "#src/services/genshinAssets/kits/gcsim/readGcsimCharacter";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";

// Every character folder of gcsim at the one tag the builder reads, by folder name, from a clone of the tag kept
// Outside the repository, cloned there first if it is absent: a folder with a config of its own, or one whose files sit
// In the subfolders it names, each file by its path below the folder. A clone checked out anywhere but the tag is
// Refused, as every value read from it would be cited at the tag
export const readGcsimTagCharacters = (directory: string): Map<string, GcsimCharacter> => {
  const charactersDirectory = join(directory, GCSIM_CHARACTERS_PATH);
  if (!existsSync(charactersDirectory))
    runGit(["clone", "--depth", "1", "--branch", GCSIM_TAG, "--quiet", GCSIM_REPOSITORY_URL, directory], process.cwd());
  const checkedOutTag = getResult(() => runGit(["describe", "--tags", "--exact-match", "HEAD"], directory).trim());
  if (checkedOutTag.unwrapOr(undefined) !== GCSIM_TAG)
    throw new InvalidOperationError(Operation.Read, directory, `is not a clone of gcsim checked out at ${GCSIM_TAG}`);
  return new Map(
    readdirSync(charactersDirectory, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          (entry.name in GcsimFolderSubfoldersMap ||
            existsSync(join(charactersDirectory, entry.name, GCSIM_CONFIG_FILE))),
      )
      .map(({ name: folder }) => {
        const fileMap = new Map(
          (GcsimFolderSubfoldersMap[folder] ?? [""]).flatMap((subfolder) => {
            const subfolderDirectory = join(charactersDirectory, folder, subfolder);
            return readdirSync(subfolderDirectory, { withFileTypes: true })
              .filter((entry) => entry.isFile())
              .map(({ name }): [string, string] => [
                posix.join(subfolder, name),
                readFileSync(join(subfolderDirectory, name), "utf8"),
              ]);
          }),
        );
        return [folder, readGcsimCharacter(folder, fileMap)];
      }),
  );
};
