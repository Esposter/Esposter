import { WEB_DIRECTORY } from "@@/scripts/constants";
import { resolve } from "node:path";

export const ENVIRONMENT_EXAMPLE_PATH = resolve(WEB_DIRECTORY, ".env.example");
export const ENVIRONMENT_TYPES_PATH = resolve(WEB_DIRECTORY, "shared/types/env.d.ts");
// Variables that take one of a closed set of values rather than any string, named by the type they are declared as
export const EnvironmentVariableTypeMap: Record<string, string> = { APP_ENV: "Environment" };
