import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where Mondstadt's daily tasks are written, the world's generated folder they are imported on demand from
export const COMMISSIONS_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "commissions",
);
export const MONDSTADT_COMMISSIONS_PATH: string = join(COMMISSIONS_GENERATED_DIRECTORY, "mondstadt.json");
