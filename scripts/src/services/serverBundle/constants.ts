import { APP_DIRECTORY, MEBIBYTE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The directory the app's build writes its server bundle to, the code a Worker runs
export const SERVER_BUNDLE_DIRECTORY: string = join(REPOSITORY_ROOT, APP_DIRECTORY, ".output", "server");
// A Worker's code is capped at 64 MiB uncompressed, with no compressed limit
export const WORKER_CODE_LIMIT_BYTES: number = 64 * MEBIBYTE;
// The extensions a Worker loads as code. A source map is not uploaded, so it is not counted
export const SERVER_BUNDLE_EXTENSIONS: readonly string[] = [".js", ".mjs", ".wasm"];
// How many of the largest files the check names when it reports the bundle
export const SERVER_BUNDLE_REPORTED_FILE_COUNT = 10;
