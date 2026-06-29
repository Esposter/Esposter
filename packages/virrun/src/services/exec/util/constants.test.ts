import { describe } from "vitest";

export const TEST_DIR = "/a";
export const TEST_FILE_NAME = "a";
// The host cache root acceptance corpora/snapshots stage into — under $HOME, never os.tmpdir, because the
// Sandbox masks /tmp with --tmpfs and would hide a /tmp staging dir from the command running inside.
export const HOME_CACHE_DIRECTORY_NAME = ".cache";

describe.todo("constants");
