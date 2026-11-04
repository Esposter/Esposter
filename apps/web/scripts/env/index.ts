import { ENVIRONMENT_TYPES_PATH } from "@@/scripts/env/constants";
import { getEnvironmentTypes } from "@@/scripts/env/services/getEnvironmentTypes";
import { writeFile } from "node:fs/promises";

await writeFile(ENVIRONMENT_TYPES_PATH, getEnvironmentTypes());
