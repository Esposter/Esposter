import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the Reputation slices are written, the world package's generated folder they are imported on demand from
export const REPUTATION_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "reputation",
);
// Mondstadt's Reputation, the slice the world reads its levels, requests and bounties from
export const MONDSTADT_REPUTATION_PATH: string = join(REPUTATION_GENERATED_DIRECTORY, "mondstadt.json");
