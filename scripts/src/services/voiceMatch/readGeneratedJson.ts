import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GENERATED_JSON_EXTENSION } from "#src/services/voiceMatch/constants";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every record a stage generated into its folder, one file each; none before the stage has ever run
export const readGeneratedJson = <T>(directory: string): T[] =>
  existsSync(directory)
    ? readdirSync(directory)
        .filter((fileName) => fileName.endsWith(GENERATED_JSON_EXTENSION))
        .map((fileName) => parseMachineJson<T>(readFileSync(join(directory, fileName), "utf8")))
    : [];
