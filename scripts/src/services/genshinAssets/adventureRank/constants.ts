import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the rank tables are written, the world package's data folder its rules import whole, as its level curves are
export const ADVENTURE_RANK_DATA_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "data",
  "adventureRank",
);
