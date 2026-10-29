import {
  GCSIM_CACHE_DIRECTORY,
  GCSIM_CHARACTERS_PATH,
  GCSIM_CONFIG_FILE,
} from "#src/services/genshinAssets/kits/constants";
import { parseGcsimYaml } from "#src/services/genshinAssets/kits/gcsim/parseGcsimYaml";
import { getResult } from "@esposter/shared";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Reads every character's config.yml at GCSIM_TAG, the gcsim files a kit reader parses, and names each the reader refuses
const charactersDirectory = join(GCSIM_CACHE_DIRECTORY, GCSIM_CHARACTERS_PATH);
const folders = readdirSync(charactersDirectory).filter((folder) =>
  existsSync(join(charactersDirectory, folder, GCSIM_CONFIG_FILE)),
);
const failures = folders.flatMap((folder) =>
  getResult(() => parseGcsimYaml(readFileSync(join(charactersDirectory, folder, GCSIM_CONFIG_FILE), "utf8"))).match(
    () => [],
    (error) => [`${folder}: ${error.message}`],
  ),
);
console.log(`${folders.length - failures.length} gcsim configs read, ${failures.length} refused`);
for (const failure of failures) console.log(failure);
process.exitCode = failures.length === 0 ? 0 : 1;
